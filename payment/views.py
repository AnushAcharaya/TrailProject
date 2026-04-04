import uuid
import hashlib
import hmac
import base64
import requests
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils import timezone

from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentInitiateSerializer,
    PaymentVerifySerializer,
    PaymentHistorySerializer
)

logger = logging.getLogger(__name__)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling eSewa payments
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        """Get payments for current user"""
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(user=user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'history':
            return PaymentHistorySerializer
        return PaymentSerializer
    
    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """
        Initiate eSewa payment
        
        POST /api/v1/payment/payments/initiate/
        {
            "amount": 1000,
            "product_code": "INSURANCE_PREMIUM",
            "product_description": "Insurance premium payment",
            "tax_amount": 0
        }
        """
        serializer = PaymentInitiateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract validated data
        amount = serializer.validated_data['amount']
        product_code = serializer.validated_data['product_code']
        product_description = serializer.validated_data.get('product_description', '')
        tax_amount = serializer.validated_data.get('tax_amount', 0)
        total_amount = amount + tax_amount
        
        # Generate unique transaction ID
        transaction_uuid = str(uuid.uuid4())
        
        # Get client IP and user agent
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create payment record
        try:
            payment = Payment.objects.create(
                user=request.user,
                transaction_uuid=transaction_uuid,
                amount=amount,
                tax_amount=tax_amount,
                total_amount=total_amount,
                product_code=product_code,
                product_description=product_description,
                status='pending',
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            logger.info(f"Payment initiated: {transaction_uuid} for user {request.user.username}")
            
        except Exception as e:
            logger.error(f"Error creating payment: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to create payment record'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Prepare eSewa payment data
        payment_data = {
            'amount': str(amount),
            'tax_amount': str(tax_amount),
            'total_amount': str(total_amount),
            'transaction_uuid': transaction_uuid,
            'product_code': product_code,
            'product_service_charge': '0',
            'product_delivery_charge': '0',
            'success_url': settings.ESEWA_SUCCESS_URL,
            'failure_url': settings.ESEWA_FAILURE_URL,
            'signed_field_names': 'total_amount,transaction_uuid,product_code',
            'signature': self._generate_signature(total_amount, transaction_uuid, product_code)
        }
        
        return Response({
            'success': True,
            'payment_id': payment.id,
            'transaction_uuid': transaction_uuid,
            'payment_data': payment_data,
            'esewa_url': settings.ESEWA_PAYMENT_URL
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        """
        Verify eSewa payment after callback
        
        POST /api/v1/payment/payments/verify/
        {
            "transaction_uuid": "uuid-here",
            "ref_id": "esewa-ref-id"
        }
        """
        serializer = PaymentVerifySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transaction_uuid = serializer.validated_data['transaction_uuid']
        ref_id = serializer.validated_data['ref_id']
        
        try:
            payment = Payment.objects.get(transaction_uuid=transaction_uuid)
            
            # Check if payment belongs to current user (unless admin)
            if not request.user.is_staff and payment.user != request.user:
                return Response(
                    {'success': False, 'error': 'Unauthorized'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if already completed
            if payment.status == 'completed':
                return Response({
                    'success': True,
                    'message': 'Payment already verified',
                    'payment_id': payment.id,
                    'status': payment.status
                })
            
            # Verify with eSewa server
            verification_result = self._verify_with_esewa(
                payment.total_amount,
                ref_id,
                transaction_uuid
            )
            
            if verification_result['success']:
                payment.mark_completed(ref_id)
                
                logger.info(f"Payment verified: {transaction_uuid}")
                
                # Trigger post-payment actions
                self._handle_successful_payment(payment)
                
                return Response({
                    'success': True,
                    'message': 'Payment verified successfully',
                    'payment_id': payment.id,
                    'status': payment.status,
                    'esewa_ref_id': ref_id
                })
            else:
                payment.mark_failed()
                logger.warning(f"Payment verification failed: {transaction_uuid}")
                
                return Response({
                    'success': False,
                    'message': 'Payment verification failed',
                    'error': verification_result.get('error', 'Verification failed')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Payment.DoesNotExist:
            logger.error(f"Payment not found: {transaction_uuid}")
            return Response({
                'success': False,
                'error': 'Payment not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error verifying payment: {str(e)}")
            return Response({
                'success': False,
                'error': 'An error occurred during verification'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        Get payment history for current user
        
        GET /api/v1/payment/payments/history/
        """
        payments = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(payments, many=True)
        
        return Response({
            'success': True,
            'count': payments.count(),
            'payments': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def status_check(self, request, pk=None):
        """
        Check payment status
        
        GET /api/v1/payment/payments/{id}/status_check/
        """
        payment = self.get_object()
        
        return Response({
            'success': True,
            'payment_id': payment.id,
            'transaction_uuid': payment.transaction_uuid,
            'status': payment.status,
            'amount': payment.total_amount,
            'product_code': payment.product_code,
            'created_at': payment.created_at,
            'completed_at': payment.completed_at
        })
    
    def _generate_signature(self, total_amount, transaction_uuid, product_code):
        """Generate HMAC signature for eSewa"""
        message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
        secret = settings.ESEWA_SECRET_KEY.encode()
        signature = hmac.new(secret, message.encode(), hashlib.sha256).digest()
        return base64.b64encode(signature).decode()
    
    def _verify_with_esewa(self, amount, ref_id, transaction_uuid):
        """Verify payment with eSewa server"""
        try:
            verification_url = 'https://uat.esewa.com.np/epay/transrec'
            # For production: https://esewa.com.np/epay/transrec
            
            verify_data = {
                'amt': str(amount),
                'rid': ref_id,
                'pid': transaction_uuid,
                'scd': settings.ESEWA_MERCHANT_ID
            }
            
            response = requests.get(verification_url, params=verify_data, timeout=10)
            
            if response.status_code == 200:
                response_text = response.text.strip().lower()
                if 'success' in response_text:
                    return {'success': True}
                else:
                    return {'success': False, 'error': 'eSewa verification failed'}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}'}
                
        except requests.RequestException as e:
            logger.error(f"eSewa verification request failed: {str(e)}")
            return {'success': False, 'error': 'Network error during verification'}
        except Exception as e:
            logger.error(f"Unexpected error during eSewa verification: {str(e)}")
            return {'success': False, 'error': 'Verification error'}
    
    def _handle_successful_payment(self, payment):
        """Handle post-payment actions based on product code"""
        try:
            if payment.product_code == 'INSURANCE_PREMIUM':
                # Activate insurance enrollment
                self._handle_insurance_payment(payment)
                logger.info(f"Insurance premium paid: {payment.transaction_uuid}")
            
            elif payment.product_code == 'APPOINTMENT_FEE':
                # Confirm appointment
                self._handle_appointment_payment(payment)
                logger.info(f"Appointment fee paid: {payment.transaction_uuid}")
            
            elif payment.product_code == 'CONSULTATION_FEE':
                # Handle consultation fee
                logger.info(f"Consultation fee paid: {payment.transaction_uuid}")
                pass
                
        except Exception as e:
            logger.error(f"Error in post-payment handling: {str(e)}")
    
    def _handle_appointment_payment(self, payment):
        """Handle appointment payment completion"""
        try:
            from appointment.models import Appointment
            
            # Find appointment by checking product_description or metadata
            # The product_description should contain appointment_id
            description = payment.product_description or ''
            
            # Extract appointment ID from description (format: "Appointment #123")
            if 'Appointment #' in description:
                appointment_id = description.split('#')[1].split()[0]
                try:
                    appointment = Appointment.objects.get(id=int(appointment_id))
                    appointment.mark_as_paid(payment)
                    logger.info(f"Appointment {appointment_id} marked as paid")
                except Appointment.DoesNotExist:
                    logger.error(f"Appointment {appointment_id} not found")
            else:
                logger.warning(f"Could not extract appointment ID from: {description}")
                
        except Exception as e:
            logger.error(f"Error handling appointment payment: {str(e)}")
    
    def _handle_insurance_payment(self, payment):
        """Handle insurance enrollment payment completion"""
        try:
            from insurance.models import Enrollment
            from django.utils import timezone
            
            # Find enrollment by checking product_description
            # The product_description should contain enrollment_id (format: "Enrollment #123")
            description = payment.product_description or ''
            
            if 'Enrollment #' in description:
                enrollment_id = description.split('#')[1].split()[0]
                try:
                    enrollment = Enrollment.objects.get(id=int(enrollment_id))
                    
                    # Update enrollment with payment information
                    enrollment.status = 'Active'
                    enrollment.payment_date = timezone.now().date()
                    enrollment.save()
                    
                    logger.info(f"Enrollment {enrollment_id} activated with payment")
                except Enrollment.DoesNotExist:
                    logger.error(f"Enrollment {enrollment_id} not found")
            else:
                logger.warning(f"Could not extract enrollment ID from: {description}")
                
        except Exception as e:
            logger.error(f"Error handling insurance payment: {str(e)}")
    
    def _get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
