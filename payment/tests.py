from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from .models import Payment

User = get_user_model()


class PaymentModelTest(TestCase):
    """Test cases for Payment model"""
    
    def setUp(self):
        """Set up test user"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_create_payment(self):
        """Test creating a payment record"""
        payment = Payment.objects.create(
            user=self.user,
            transaction_uuid='test-uuid-123',
            amount=Decimal('1000.00'),
            tax_amount=Decimal('0.00'),
            total_amount=Decimal('1000.00'),
            product_code='INSURANCE_PREMIUM',
            status='pending'
        )
        
        self.assertEqual(payment.user, self.user)
        self.assertEqual(payment.status, 'pending')
        self.assertEqual(payment.total_amount, Decimal('1000.00'))
    
    def test_mark_completed(self):
        """Test marking payment as completed"""
        payment = Payment.objects.create(
            user=self.user,
            transaction_uuid='test-uuid-456',
            amount=Decimal('500.00'),
            tax_amount=Decimal('0.00'),
            total_amount=Decimal('500.00'),
            product_code='APPOINTMENT_FEE',
            status='pending'
        )
        
        payment.mark_completed('esewa-ref-123')
        
        self.assertEqual(payment.status, 'completed')
        self.assertEqual(payment.esewa_ref_id, 'esewa-ref-123')
        self.assertIsNotNone(payment.completed_at)
    
    def test_mark_failed(self):
        """Test marking payment as failed"""
        payment = Payment.objects.create(
            user=self.user,
            transaction_uuid='test-uuid-789',
            amount=Decimal('750.00'),
            tax_amount=Decimal('0.00'),
            total_amount=Decimal('750.00'),
            product_code='CONSULTATION_FEE',
            status='pending'
        )
        
        payment.mark_failed()
        
        self.assertEqual(payment.status, 'failed')
    
    def test_payment_str(self):
        """Test payment string representation"""
        payment = Payment.objects.create(
            user=self.user,
            transaction_uuid='test-uuid-999',
            amount=Decimal('1500.00'),
            tax_amount=Decimal('0.00'),
            total_amount=Decimal('1500.00'),
            product_code='INSURANCE_PREMIUM',
            status='completed'
        )
        
        expected_str = f"{self.user.username} - INSURANCE_PREMIUM - Rs.1500.00 - completed"
        self.assertEqual(str(payment), expected_str)
    
    def test_unique_transaction_uuid(self):
        """Test that transaction_uuid must be unique"""
        Payment.objects.create(
            user=self.user,
            transaction_uuid='unique-uuid',
            amount=Decimal('100.00'),
            tax_amount=Decimal('0.00'),
            total_amount=Decimal('100.00'),
            product_code='OTHER',
            status='pending'
        )
        
        # Attempting to create another payment with same UUID should fail
        with self.assertRaises(Exception):
            Payment.objects.create(
                user=self.user,
                transaction_uuid='unique-uuid',
                amount=Decimal('200.00'),
                tax_amount=Decimal('0.00'),
                total_amount=Decimal('200.00'),
                product_code='OTHER',
                status='pending'
            )
