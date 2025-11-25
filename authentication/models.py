import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from .validators import validate_image_size, validate_image_extension
from django.conf import settings
from datetime import timedelta

ROLE_CHOICES = [
    ('farmer', 'Farmer'),
    ('vet', 'Veterinarian'),
    ('admin', 'Admin'),
]

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    address = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, unique=True)
    farm_name = models.CharField(max_length=150, blank=True, null=True)
    nid_photo = models.ImageField(upload_to='nid_photos/', blank=True, null=True,
                                  validators=[validate_image_extension, validate_image_size])
    specialization = models.CharField(max_length=150, blank=True, null=True)
    certificate_photo = models.ImageField(upload_to='certificates/', blank=True, null=True,
                                          validators=[validate_image_extension, validate_image_size])

    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)

    REQUIRED_FIELDS = ['email', 'phone', 'full_name']

    def __str__(self):
        return self.username


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='email_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(days=1)


class PhoneOTP(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='phone_otps')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=10)


class PasswordResetToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='password_reset_tokens', on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def is_valid(self):
        # Token valid for 30 minutes
        return not self.used and timezone.now() <= self.created_at + timedelta(minutes=30)

    def mark_used(self):
        self.used = True
        self.save()

