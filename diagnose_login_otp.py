"""
Comprehensive diagnostic for Login OTP issues
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import CustomUser, LoginOTP
from django.core.mail import send_mail
from django.conf import settings

print("=" * 60)
print("LOGIN OTP DIAGNOSTIC")
print("=" * 60)

# 1. Check if users exist
print("\n1. CHECKING USERS...")
users = CustomUser.objects.all()
if not users.exists():
    print("   ❌ No users found!")
    print("   Create a user first at: http://localhost:5173/create-account")
else:
    print(f"   ✓ Found {users.count()} user(s)")
    for user in users:
        print(f"   - {user.email} ({user.role}) - Status: {user.status}")

# 2. Check email configuration
print("\n2. CHECKING EMAIL CONFIGURATION...")
print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"   EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"   EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"   EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"   EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"   EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")

# 3. Test email sending
print("\n3. TESTING EMAIL SENDING...")
test_email = input("   Enter your email to test: ")
try:
    send_mail(
        'Test Email from Django',
        'This is a test email. If you receive this, email is working!',
        settings.DEFAULT_FROM_EMAIL,
        [test_email],
        fail_silently=False,
    )
    print("   ✓ Test email sent successfully!")
    print("   Check your inbox (and spam folder)")
except Exception as e:
    print(f"   ❌ Failed to send email: {str(e)}")

# 4. Check recent LoginOTP records
print("\n4. CHECKING RECENT LOGIN OTP RECORDS...")
recent_otps = LoginOTP.objects.all().order_by('-created_at')[:5]
if not recent_otps.exists():
    print("   ℹ️  No LoginOTP records found")
    print("   This means no one has tried to login yet")
else:
    print(f"   Found {recent_otps.count()} recent OTP(s):")
    for otp in recent_otps:
        print(f"   - User: {otp.user.email}")
        print(f"     Email Code: {otp.email_code}")
        print(f"     Phone Code: {otp.phone_code}")
        print(f"     Created: {otp.created_at}")
        print(f"     Used: {otp.used}")
        print(f"     Expired: {otp.is_expired()}")
        print()

# 5. Check Celery connection
print("\n5. CHECKING CELERY/REDIS CONNECTION...")
try:
    from celery import current_app
    inspect = current_app.control.inspect()
    stats = inspect.stats()
    if stats:
        print("   ✓ Celery workers are running")
        for worker, info in stats.items():
            print(f"   - Worker: {worker}")
    else:
        print("   ❌ No Celery workers found!")
        print("   Start Celery: celery -A backend worker --loglevel=info")
except Exception as e:
    print(f"   ❌ Celery connection error: {str(e)}")

# 6. Check environment variables
print("\n6. CHECKING ENVIRONMENT VARIABLES...")
print(f"   ENABLE_SMS_OTP: {os.getenv('ENABLE_SMS_OTP', 'Not set')}")
print(f"   SMS_DEV_MODE: {os.getenv('SMS_DEV_MODE', 'Not set')}")

print("\n" + "=" * 60)
print("DIAGNOSTIC COMPLETE")
print("=" * 60)
