import logging

from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailVerificationToken, PhoneOTP
from .email_utils import send_email_sync, send_sms_sync
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .models import CustomUser, PasswordResetToken


import random

logger = logging.getLogger(__name__)
User = get_user_model()


import re
import smtplib
import socket

# Domains we accept directly without DNS lookup (consumer Gmail).
_GMAIL_DOMAINS = {'gmail.com', 'googlemail.com'}

# MX-host substrings that mean Google Workspace handles this domain's mail.
_GOOGLE_MX_HINTS = ('google.com', 'googlemail.com', 'aspmx.l.google.com', 'googlehosted.com')

# A starter blocklist of known disposable / throwaway email services.
# The most popular ones are listed; you can grow this list freely.
_DISPOSABLE_DOMAINS = {
    'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
    'tempmail.com', 'tempmail.net', 'tempmail.org', 'temp-mail.org', 'temp-mail.io',
    '10minutemail.com', '10minutemail.net', '20minutemail.com',
    'throwawaymail.com', 'throwaway.email', 'getnada.com', 'getairmail.com',
    'yopmail.com', 'fakeinbox.com', 'maildrop.cc', 'sharklasers.com',
    'mailcatch.com', 'mintemail.com', 'mailnesia.com', 'spamgourmet.com',
    'trashmail.com', 'tempinbox.com', 'mohmal.com', 'mytemp.email',
    'inboxbear.com', 'mail-temporaire.fr', 'jetable.org', 'spambox.us',
    'dispostable.com', 'mailnator.com', 'tmpmail.org', 'mvrht.com',
    'getmail.online', 'mail.tm', 'mail7.io', 'einrot.com', 'tempr.email',
}

# Patterns in the LOCAL part of the email that strongly suggest it's fake.
# Each is a precompiled regex tested against the lowercased local part.
_FAKE_LOCAL_PATTERNS = [
    re.compile(r'^test\d*$'),                  # test, test1, test123
    re.compile(r'^fake\d*$'),                  # fake, fake42
    re.compile(r'^spam\d*$'),
    re.compile(r'^abc+\d*$'),                  # abc, abcabc1
    re.compile(r'^xyz+\d*$'),
    re.compile(r'^(qwerty|qwertyuiop|asdf|asdfgh|asdfghjkl|zxcv|zxcvbn|zxcvbnm)\d*$'),
    re.compile(r'^(.)\1{4,}\d*$'),             # aaaaa, bbbbbb1
    re.compile(r'^[a-z]{1,2}\d{3,}$') ,        # ab1234, x99999 (single-letter prefix + many digits)
    re.compile(r'^\d+$'),                      # purely numeric
    re.compile(r'^(none|null|nobody|user|admin|email|sample)\d*$'),
]

# Tiny in-process cache so we don't re-resolve MX for the same domain on every
# registration during a session. {domain: bool}
_google_domain_cache = {}
_smtp_existence_cache = {}  # {email: (exists, reason)}


def _is_google_hosted_email(email: str) -> bool:
    """Return True if the email's DOMAIN is hosted by Google."""
    if not email or '@' not in email:
        return False
    domain = email.rsplit('@', 1)[1].strip().lower()

    if domain in _GMAIL_DOMAINS:
        return True

    if domain in _google_domain_cache:
        return _google_domain_cache[domain]

    try:
        import dns.resolver
        resolver = dns.resolver.Resolver()
        resolver.lifetime = 3.0
        resolver.timeout = 3.0
        answers = resolver.resolve(domain, 'MX')
        for rdata in answers:
            host = str(rdata.exchange).rstrip('.').lower()
            if any(hint in host for hint in _GOOGLE_MX_HINTS):
                _google_domain_cache[domain] = True
                return True
        _google_domain_cache[domain] = False
        return False
    except Exception:
        _google_domain_cache[domain] = False
        return False


def _looks_like_fake_pattern(local: str) -> bool:
    """Heuristics over the local part. Catches keyboard mashing & test names."""
    if not local:
        return True
    # Way too short or way too long
    if len(local) < 3 or len(local) > 64:
        return True
    for pat in _FAKE_LOCAL_PATTERNS:
        if pat.match(local):
            return True
    # 6+ consecutive consonants — likely keyboard mash
    if re.search(r'[bcdfghjklmnpqrstvwxz]{6,}', local):
        return True
    return False


def _smtp_mailbox_exists(email: str, timeout: float = 4.0) -> tuple:
    """
    Best-effort SMTP RCPT TO check.
    Returns (exists, reason).

    Returns ``(True, 'unverifiable')`` when the network is blocked or the
    server is ambiguous — we never want to block legitimate users because
    *we* can't reach port 25 from a residential ISP.
    Returns ``(False, '...')`` only when we get a clear "no such mailbox"
    response from the mail server.
    """
    if email in _smtp_existence_cache:
        return _smtp_existence_cache[email]

    if '@' not in email:
        result = (False, 'invalid format')
        _smtp_existence_cache[email] = result
        return result

    local, domain = email.lower().split('@', 1)

    try:
        import dns.resolver
        resolver = dns.resolver.Resolver()
        resolver.lifetime = timeout
        resolver.timeout = timeout
        mx_records = sorted(
            resolver.resolve(domain, 'MX'), key=lambda r: r.preference
        )
        if not mx_records:
            _smtp_existence_cache[email] = (True, 'no mx — unverifiable')
            return (True, 'no mx — unverifiable')
        mx_host = str(mx_records[0].exchange).rstrip('.')
    except Exception as exc:
        _smtp_existence_cache[email] = (True, f'dns failure: {exc}')
        return (True, f'dns failure: {exc}')

    try:
        smtp = smtplib.SMTP(timeout=timeout)
        smtp.connect(mx_host, 25)
        smtp.helo('lhmms.local')
        smtp.mail('verify@lhmms.local')
        code, msg = smtp.rcpt(email)
        try:
            smtp.quit()
        except Exception:
            pass

        # 250 (or 251 for non-local forwarding): exists.
        # 550/551/553: clearly does not exist.
        # Anything else: ambiguous — don't block.
        if 200 <= code < 300:
            result = (True, f'smtp 2xx ({code})')
        elif code in (550, 551, 553):
            result = (False, f'mailbox does not exist (smtp {code})')
        else:
            result = (True, f'smtp {code} (ambiguous)')
        _smtp_existence_cache[email] = result
        return result
    except (socket.timeout, OSError, smtplib.SMTPException) as exc:
        result = (True, f'smtp probe failed: {exc}')
        _smtp_existence_cache[email] = result
        return result


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'address', 'password', 'role',
                  'phone', 'farm_name', 'nid_photo', 'specialization', 'certificate_photo']

    def validate_email(self, value):
        """
        Reject obviously fake emails using stacked server-side checks.
        No user-facing verification step is involved.

        Layers (cheapest → most expensive):
          1. Domain must be Google-hosted (gmail.com or Google Workspace MX)
          2. Domain must not be a known disposable / throwaway service
          3. Local part must not match obvious fake patterns
             (test123, qwerty, aaaaa, keyboard mashes, etc.)
          4. SMTP RCPT TO probe — best-effort. Only blocks the registration
             when the mail server responds with a clear 5xx "no such mailbox".
        """
        value = (value or '').strip().lower()

        # 1. Google-hosted domain
        if not _is_google_hosted_email(value):
            raise serializers.ValidationError(
                'Please use a valid Google email (Gmail or a domain hosted by Google).'
            )

        # 2. Disposable / throwaway service
        domain = value.rsplit('@', 1)[1]
        if domain in _DISPOSABLE_DOMAINS:
            raise serializers.ValidationError(
                'Disposable / temporary email addresses are not allowed.'
            )

        # 3. Suspicious local-part patterns
        local = value.split('@', 1)[0]
        if _looks_like_fake_pattern(local):
            raise serializers.ValidationError(
                "This email looks invalid. Please use your real Gmail address."
            )

        # 4. SMTP probe — best-effort, opt-in via env var.
        # Most residential ISPs and cloud providers block outbound port 25,
        # so this layer is OFF by default (otherwise every registration
        # waits ~5s for nothing). Set ENABLE_SMTP_VERIFY=True in .env when
        # deployed somewhere that allows outbound port 25.
        import os as _os
        if _os.getenv('ENABLE_SMTP_VERIFY', 'False').lower() == 'true':
            exists, reason = _smtp_mailbox_exists(value, timeout=6.0)
            if not exists:
                raise serializers.ValidationError(
                    "This email address doesn't exist. Please use a real Gmail account."
                )

        return value

    def validate(self, data):
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

        validate_password(data.get('password'))
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True
        # Email domain was already verified to be Google-hosted in validate_email,
        # so the email is trusted at the domain level. Account-level activation
        # still requires admin approval (status='pending' is the default).
        user.is_email_verified = True
        user.save()
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
    token = serializers.CharField(max_length=6)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField(max_length=6)
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