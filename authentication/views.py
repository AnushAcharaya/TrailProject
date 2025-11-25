from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RegistrationSerializer, EmailVerifySerializer, PhoneSendOTPSerializer, PhoneVerifySerializer
from .models import EmailVerificationToken, PhoneOTP, CustomUser, PasswordResetToken
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
from .tasks import send_reset_token_email
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

    def get(self, request):
        serializer = EmailVerifySerializer(data=request.query_params)
        if serializer.is_valid():
            token_val = serializer.validated_data['token']
            token = get_object_or_404(EmailVerificationToken, token=token_val, used=False)
            if token.is_expired():
                return Response({'success': False, 'message': 'Token expired.'}, status=status.HTTP_400_BAD_REQUEST)
            token.used = True
            token.save()
            user = token.user
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
        verification_link = f"{request.build_absolute_uri('/')}api/v1/auth/verify-email/?token={token.token}"
        # send email
        from django.core.mail import send_mail
        from django.conf import settings
        send_mail('Verify your email', f'Click {verification_link}', settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
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
    def post(self, request):
        serializer = ForgotPasswordEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "No user registered with this email"}, status=status.HTTP_400_BAD_REQUEST)

        token_obj = PasswordResetToken.objects.create(user=user)
        send_reset_token_email(user, token_obj.token)

        return Response({"message": "Reset token sent to your email"}, status=status.HTTP_200_OK)


class VerifyTokenView(APIView):
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