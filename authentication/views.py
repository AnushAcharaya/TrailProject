from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from .serializers import RegistrationSerializer, EmailVerifySerializer, PhoneSendOTPSerializer, PhoneVerifySerializer
from .models import EmailVerificationToken, PhoneOTP, CustomUser, PasswordResetToken, LoginOTP
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from .serializers import LoginSerializer
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .serializers import (
    ForgotPasswordEmailSerializer,
    ForgotPasswordTokenSerializer,
    ResetPasswordSerializer
)
from .email_utils import send_email_sync, send_sms_sync
from rest_framework_simplejwt.tokens import RefreshToken
import random


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            return Response({'success': True, 'message': 'User registered. Check email for verification.'}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({'success': False, 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            token = EmailVerificationToken.objects.filter(user=user, code=code, used=False).order_by('-created_at').first()
            if not token:
                return Response({'success': False, 'message': 'Invalid code.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if token.is_expired():
                return Response({'success': False, 'message': 'Code expired.'}, status=status.HTTP_400_BAD_REQUEST)
            
            token.used = True
            token.save()
            user.is_email_verified = True
            user.save()
            return Response({'success': True, 'message': 'Email verified.'})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'success': False, 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        token = EmailVerificationToken.objects.create(user=user)
        
        # Send email synchronously
        subject = 'Verify your email'
        message = f'Your email verification code is: {token.code}\n\nThis code will expire in 10 minutes.'
        send_email_sync(user.email, subject, message)
        
        return Response({'success': True, 'message': 'Verification email resent.'})


class SendPhoneOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PhoneSendOTPSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            # find user or create a temporary user entry? We'll try to find user
            try:
                user = CustomUser.objects.get(phone=phone)
            except CustomUser.DoesNotExist:
                return Response({'success': False, 'message': 'User with this phone not found.'}, status=status.HTTP_404_NOT_FOUND)

            code = f"{random.randint(100000, 999999)}"
            PhoneOTP.objects.create(user=user, code=code)
            # integrate with SMS provider here — for dev we'll just return code in response (NOT for prod)
            return Response({'success': True, 'message': 'OTP sent (dev)', 'otp': code})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class VerifyPhoneOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PhoneVerifySerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone']
            code = serializer.validated_data['code']
            
            try:
                user = CustomUser.objects.get(phone=phone)
            except CustomUser.DoesNotExist:
                return Response({'success': False, 'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if using Twilio Verify API
            import os
            if os.getenv('SMS_DEV_MODE', 'False') == 'False' and os.getenv('TWILIO_VERIFY_SERVICE_SID'):
                # Use Twilio Verify API to check the code
                from twilio.rest import Client
                from decouple import config
                
                try:
                    account_sid = config('TWILIO_ACCOUNT_SID')
                    auth_token = config('TWILIO_AUTH_TOKEN')
                    verify_service_sid = config('TWILIO_VERIFY_SERVICE_SID')
                    
                    client = Client(account_sid, auth_token)
                    
                    verification_check = client.verify \
                        .v2 \
                        .services(verify_service_sid) \
                        .verification_checks \
                        .create(to=phone, code=code)
                    
                    if verification_check.status == 'approved':
                        user.is_phone_verified = True
                        user.save()
                        return Response({'success': True, 'message': 'Phone verified.'})
                    else:
                        return Response({'success': False, 'message': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)
                        
                except Exception as e:
                    print(f"Twilio Verify check error: {str(e)}")
                    return Response({'success': False, 'message': 'Verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Fallback to database OTP check (for dev mode)
                otp = PhoneOTP.objects.filter(user=user, code=code, used=False).order_by('-created_at').first()
                if not otp:
                    return Response({'success': False, 'message': 'Invalid code.'}, status=status.HTTP_400_BAD_REQUEST)
                if otp.is_expired():
                    return Response({'success': False, 'message': 'OTP expired.'}, status=status.HTTP_400_BAD_REQUEST)
                otp.used = True
                otp.save()
                user.is_phone_verified = True
                user.save()
            return Response({'success': True, 'message': 'Phone verified.'})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return Response({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            },
            "access": serializer.validated_data['access'],
            "refresh": serializer.validated_data['refresh'],
        }, status=status.HTTP_200_OK)





class ForgotPasswordEmailView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "No user registered with this email"}, status=status.HTTP_400_BAD_REQUEST)

        token_obj = PasswordResetToken.objects.create(user=user)
        
        # Send password reset email synchronously
        subject = "Password Reset Request"
        message = f"Hello {user.full_name},\n\nUse the following token to reset your password: {token_obj.token}\n\nThis token is valid for 30 minutes."
        send_email_sync(user.email, subject, message)

        return Response({"message": "Reset token sent to your email"}, status=status.HTTP_200_OK)


class VerifyTokenView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        token = serializer.validated_data['token']

        user = get_object_or_404(CustomUser, email=email)
        try:
            token_obj = PasswordResetToken.objects.get(user=user, token=token, used=False)
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        if not token_obj.is_valid():
            return Response({"error": "Token has expired"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Token is valid"}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        user = get_object_or_404(CustomUser, email=email)
        token_obj = get_object_or_404(PasswordResetToken, user=user, token=token, used=False)

        if not token_obj.is_valid():
            return Response({"error": "Token has expired"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        token_obj.mark_used()

        return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)


# Admin Views
from rest_framework.permissions import IsAuthenticated
from .serializers import AdminUserListSerializer

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is admin
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all users except admins
        users = CustomUser.objects.exclude(role='admin').order_by('-date_joined')
        serializer = AdminUserListSerializer(users, many=True, context={'request': request})
        return Response({'success': True, 'users': serializer.data}, status=status.HTTP_200_OK)


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is admin
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get statistics
        total_registrations = CustomUser.objects.exclude(role='admin').count()
        pending_reviews = CustomUser.objects.filter(status='pending').exclude(role='admin').count()
        approved_accounts = CustomUser.objects.filter(status='approved').exclude(role='admin').count()
        
        # Active this week (users who joined in the last 7 days)
        from datetime import timedelta
        from django.db.models import Count
        from django.db.models.functions import TruncMonth, TruncDay
        import calendar
        
        week_ago = timezone.now() - timedelta(days=7)
        active_this_week = CustomUser.objects.filter(
            date_joined__gte=week_ago
        ).exclude(role='admin').count()
        
        # Monthly verifications data (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_verifications = CustomUser.objects.filter(
            date_joined__gte=six_months_ago
        ).exclude(role='admin').annotate(
            month=TruncMonth('date_joined')
        ).values('month', 'role').annotate(
            count=Count('id')
        ).order_by('month')
        
        # Process monthly data
        monthly_data = {}
        for item in monthly_verifications:
            month_name = item['month'].strftime('%b')
            if month_name not in monthly_data:
                monthly_data[month_name] = {'name': month_name, 'farmers': 0, 'veterinarians': 0}
            
            if item['role'] == 'farmer':
                monthly_data[month_name]['farmers'] = item['count']
            elif item['role'] == 'vet':
                monthly_data[month_name]['veterinarians'] = item['count']
        
        # Weekly activity data (last 7 days)
        weekly_activity = CustomUser.objects.filter(
            date_joined__gte=week_ago
        ).exclude(role='admin').annotate(
            day=TruncDay('date_joined')
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        # Process weekly data
        weekly_data = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i in range(7):
            day = timezone.now() - timedelta(days=6-i)
            day_name = day_names[day.weekday()]
            count = 0
            
            for item in weekly_activity:
                if item['day'].date() == day.date():
                    count = item['count']
                    break
            
            weekly_data.append({'name': day_name, 'value': count})
        
        return Response({
            'success': True,
            'stats': {
                'total_registrations': total_registrations,
                'pending_reviews': pending_reviews,
                'approved_accounts': approved_accounts,
                'active_this_week': active_this_week
            },
            'monthly_verifications': list(monthly_data.values()),
            'weekly_activity': weekly_data
        }, status=status.HTTP_200_OK)


class ApproveUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        # Check if user is admin
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can approve users'}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(CustomUser, id=user_id)
        user.status = 'approved'
        user.is_active = True
        user.save()
        
        return Response({'success': True, 'message': 'User approved successfully'}, status=status.HTTP_200_OK)


class DeclineUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        # Check if user is admin
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can decline users'}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(CustomUser, id=user_id)
        user.status = 'declined'
        user.is_active = False
        user.save()
        
        return Response({'success': True, 'message': 'User declined successfully'}, status=status.HTTP_200_OK)


# Login OTP Views
from .serializers import SendLoginOTPSerializer, VerifyLoginOTPSerializer

class SendLoginOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = SendLoginOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        phone = serializer.validated_data.get('phone', '')
        password = serializer.validated_data['password']
        role = serializer.validated_data['role']
        
        # Find user by email
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'success': False, 'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify password
        if not user.check_password(password):
            return Response({'success': False, 'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify role
        if user.role != role:
            return Response({'success': False, 'error': f'You do not have access as {role}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For farmer/vet, verify phone matches
        if role in ['farmer', 'vet']:
            if not phone or user.phone != phone:
                return Response({'success': False, 'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is approved (except admin)
        if role != 'admin':
            if user.status == 'pending':
                return Response({'success': False, 'error': 'Your account is pending admin approval'}, status=status.HTTP_400_BAD_REQUEST)
            elif user.status == 'declined':
                return Response({'success': False, 'error': 'Your account has been declined'}, status=status.HTTP_400_BAD_REQUEST)
            elif user.status != 'approved':
                return Response({'success': False, 'error': 'Your account is not approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create login OTP
        login_otp = LoginOTP.objects.create(user=user)
        
        # Send email OTP synchronously
        subject = 'Login Verification Code'
        message = f'Your login verification code is: {login_otp.email_code}\n\nThis code will expire in 10 minutes.'
        send_email_sync(user.email, subject, message)
        
        # Send phone OTP for farmer/vet
        if role in ['farmer', 'vet']:
            import os
            enable_sms = os.getenv('ENABLE_SMS_OTP', 'True') == 'True'
            
            if enable_sms:
                otp_message = f'Your login verification code is: {login_otp.phone_code}'
                send_sms_sync(user.phone, otp_message)
            else:
                # For development: Send phone OTP via email
                subject = 'Phone Login Verification Code'
                message = f'Your phone login verification code is: {login_otp.phone_code}\n\n(SMS disabled in development mode)'
                send_email_sync(user.email, subject, message)
        
        return Response({'success': True, 'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)


class VerifyLoginOTPView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = VerifyLoginOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        email_code = serializer.validated_data['email_code']
        # phone_code = serializer.validated_data.get('phone_code', '')  # COMMENTED OUT - Phone OTP not required
        role = serializer.validated_data['role']
        
        # Find user
        try:
            user = CustomUser.objects.get(email=email, role=role)
        except CustomUser.DoesNotExist:
            return Response({'success': False, 'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find latest unused login OTP
        try:
            login_otp = LoginOTP.objects.filter(user=user, used=False).latest('created_at')
        except LoginOTP.DoesNotExist:
            return Response({'success': False, 'error': 'No OTP found. Please request a new one'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if expired
        if login_otp.is_expired():
            return Response({'success': False, 'error': 'OTP has expired. Please request a new one'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify email OTP
        if login_otp.email_code != email_code:
            return Response({'success': False, 'error': 'Invalid email OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # COMMENTED OUT - Phone OTP verification not required
        # For farmer/vet, verify phone OTP
        # if role in ['farmer', 'vet']:
        #     if not phone_code or login_otp.phone_code != phone_code:
        #         return Response({'success': False, 'error': 'Invalid phone OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        login_otp.used = True
        login_otp.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
            }
        }, status=status.HTTP_200_OK)
