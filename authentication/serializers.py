from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailVerificationToken, PhoneOTP
from .tasks import send_verification_email, send_sms_otp
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .models import CustomUser, PasswordResetToken


import random

User = get_user_model()


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'address', 'password', 'role',
                  'phone', 'farm_name', 'nid_photo', 'specialization', 'certificate_photo']

    def validate(self, data):
        role = data.get('role')
        if role == 'farmer':
            if not data.get('farm_name'):
                raise serializers.ValidationError({'farm_name': 'Farm name is required for farmers.'})
            if not data.get('nid_photo'):
                raise serializers.ValidationError({'nid_photo': 'NID photo is required for farmers.'})
        if role == 'vet':
            if not data.get('specialization'):
                raise serializers.ValidationError({'specialization': 'Specialization is required for vets.'})
            if not data.get('certificate_photo'):
                raise serializers.ValidationError({'certificate_photo': 'Certificate photo is required for vets.'})

        # password strength
        validate_password(data.get('password'))
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True  # user can login but email not verified yet
        user.save()

        # --- Email Verification ---
        token = EmailVerificationToken.objects.create(user=user)
        verification_link = f"{self.context['request'].build_absolute_uri('/')}api/v1/auth/verify-email/?token={token.token}"
        subject = 'Verify your email'
        message = f'Please click the link to verify your email: {verification_link}'
        send_verification_email.delay(user.email, subject, message)

        # --- Phone OTP Verification ---
        otp = PhoneOTP.objects.create(user=user)
        otp_message = f'Your verification code is: {otp.code}'
        send_sms_otp.delay(user.phone, otp_message)

        return user


class EmailVerifySerializer(serializers.Serializer):
    token = serializers.UUIDField()


class PhoneSendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField()


class PhoneVerifySerializer(serializers.Serializer):
    phone = serializers.CharField()
    code = serializers.CharField()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()

    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        role = attrs.get('role')

        if not email or not password or not role:
            raise serializers.ValidationError("Email, password, and role are required.")

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("Your account is inactive.")

        if not user.is_email_verified:
            raise serializers.ValidationError("Email not verified. Please verify your email.")

        if not user.is_phone_verified:
            raise serializers.ValidationError("Phone not verified. Please verify your phone.")

        if role != user.role:
            raise serializers.ValidationError(f"You do not have access as {role}.")

        # Optionally, check if admin approved (if needed)
        if user.role != 'admin' and not user.is_active:
            raise serializers.ValidationError("Admin has not approved your registration yet.")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        attrs['refresh'] = str(refresh)
        attrs['access'] = str(refresh.access_token)
        attrs['user'] = user
        return attrs


class ForgotPasswordEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ForgotPasswordTokenSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.UUIDField()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        validate_password(data['new_password'])
        return data