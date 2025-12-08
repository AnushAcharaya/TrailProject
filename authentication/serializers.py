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
        # Address validation
        if not data.get('address'):
            raise serializers.ValidationError({'address': 'Address is required.'})
        
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
        subject = 'Verify your email'
        message = f'Your email verification code is: {token.code}\n\nThis code will expire in 10 minutes.'
        send_verification_email.delay(user.email, subject, message)

        # --- Phone OTP Verification ---
        otp = PhoneOTP.objects.create(user=user)
        
        # Check if SMS is enabled
        import os
        enable_sms = os.getenv('ENABLE_SMS_OTP', 'True') == 'True'
        
        if enable_sms:
            otp_message = f'Your verification code is: {otp.code}'
            send_sms_otp.delay(user.phone, otp_message)
        else:
            # For development: Send phone OTP via email instead
            subject = 'Phone Verification Code'
            message = f'Your phone verification code is: {otp.code}\n\nThis code will expire in 10 minutes.\n\n(SMS disabled in development mode)'
            send_verification_email.delay(user.email, subject, message)

        return user


class EmailVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)


class PhoneSendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField()


class PhoneVerifySerializer(serializers.Serializer):
    phone = serializers.CharField()
    code = serializers.CharField()


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()

    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    
    def get_user(self, obj):
        user = obj.get('user')
        if user:
            return {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role,
            }
        return None

    def validate(self, attrs):
        phone = attrs.get('phone')
        password = attrs.get('password')
        role = attrs.get('role')

        if not phone or not password or not role:
            raise serializers.ValidationError("Phone, password, and role are required.")

        # Find user by phone number
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")

        # Check password
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("Your account is inactive.")

        # Check if at least one verification method is completed
        if not user.is_email_verified and not user.is_phone_verified:
            raise serializers.ValidationError("Account not verified. Please verify your email or phone.")

        if role != user.role:
            raise serializers.ValidationError(f"You do not have access as {role}.")

        # Check if admin approved the user
        if user.role != 'admin':
            if user.status == 'pending':
                raise serializers.ValidationError("Your account is pending admin approval.")
            elif user.status == 'declined':
                raise serializers.ValidationError("Your account has been declined by admin.")
            elif user.status != 'approved':
                raise serializers.ValidationError("Your account is not approved yet.")

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


class SendLoginOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()


class VerifyLoginOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    email_code = serializers.CharField(max_length=6)
    phone_code = serializers.CharField(max_length=6, required=False, allow_blank=True)
    role = serializers.CharField()


class AdminUserListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name', read_only=True)
    farmName = serializers.CharField(source='farm_name', read_only=True)
    nid_photo_url = serializers.SerializerMethodField()
    certificate_photo_url = serializers.SerializerMethodField()
    submittedDate = serializers.DateTimeField(source='date_joined', format='%B %d, %Y', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'role', 'status', 'phone', 'email', 'address', 
                  'farmName', 'specialization', 'nid_photo_url', 'certificate_photo_url', 
                  'submittedDate']
    
    def get_nid_photo_url(self, obj):
        if obj.nid_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.nid_photo.url)
        return None
    
    def get_certificate_photo_url(self, obj):
        if obj.certificate_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.certificate_photo.url)
        return None