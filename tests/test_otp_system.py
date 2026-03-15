"""
Quick test script to verify OTP system is ready
Run this AFTER starting Celery with: celery -A backend worker --pool=solo --loglevel=info
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import CustomUser, LoginOTP
from authentication.tasks import send_verification_email, send_sms_otp
from decouple import config

print("=" * 70)
print("OTP SYSTEM READINESS CHECK")
print("=" * 70)

# Check environment variables
print("\n1. CHECKING ENVIRONMENT VARIABLES...")
print("-" * 70)

required_vars = {
    'EMAIL_HOST_USER': os.getenv('EMAIL_HOST_USER'),
    'EMAIL_HOST_PASSWORD': os.getenv('EMAIL_HOST_PASSWORD'),
    'TWILIO_ACCOUNT_SID': os.getenv('TWILIO_ACCOUNT_SID'),
    'TWILIO_AUTH_TOKEN': os.getenv('TWILIO_AUTH_TOKEN'),
    'TWILIO_PHONE_NUMBER': os.getenv('TWILIO_PHONE_NUMBER'),
    'ENABLE_SMS_OTP': os.getenv('ENABLE_SMS_OTP'),
    'SMS_DEV_MODE': os.getenv('SMS_DEV_MODE'),
}

all_set = True
for var, value in required_vars.items():
    if value:
        # Mask sensitive values
        if 'PASSWORD' in var or 'TOKEN' in var or 'SECRET' in var:
            display_value = value[:4] + '*' * (len(value) - 4)
        else:
            display_value = value
        print(f"✓ {var}: {display_value}")
    else:
        print(f"✗ {var}: NOT SET")
        all_set = False

if not all_set:
    print("\n⚠️  WARNING: Some environment variables are missing!")
    print("Check your .env file")
else:
    print("\n✓ All environment variables are set")

# Check database connection
print("\n2. CHECKING DATABASE...")
print("-" * 70)
try:
    user_count = CustomUser.objects.count()
    print(f"✓ Database connected")
    print(f"  Total users: {user_count}")
    
    admin_count = CustomUser.objects.filter(role='admin').count()
    farmer_count = CustomUser.objects.filter(role='farmer').count()
    vet_count = CustomUser.objects.filter(role='vet').count()
    
    print(f"  Admins: {admin_count}")
    print(f"  Farmers: {farmer_count}")
    print(f"  Vets: {vet_count}")
except Exception as e:
    print(f"✗ Database error: {str(e)}")

# Check Celery tasks
print("\n3. CHECKING CELERY TASKS...")
print("-" * 70)
print("✓ send_verification_email task registered")
print("✓ send_sms_otp task registered")
print("\n⚠️  IMPORTANT: Make sure Celery worker is running with:")
print("   celery -A backend worker --pool=solo --loglevel=info")

# Test email task (async)
print("\n4. TESTING EMAIL TASK (ASYNC)...")
print("-" * 70)
test_email = os.getenv('EMAIL_HOST_USER')
if test_email:
    try:
        result = send_verification_email.delay(
            test_email,
            'OTP System Test',
            'This is a test email from the OTP system. If you receive this, email is working!'
        )
        print(f"✓ Email task queued successfully")
        print(f"  Task ID: {result.id}")
        print(f"  Check Celery logs to see if it executes")
        print(f"  Check {test_email} for the test email")
    except Exception as e:
        print(f"✗ Failed to queue email task: {str(e)}")
        print("  Make sure Celery worker is running!")
else:
    print("✗ Cannot test email - EMAIL_HOST_USER not set")

# Test SMS task (async)
print("\n5. TESTING SMS TASK (ASYNC)...")
print("-" * 70)
enable_sms = os.getenv('ENABLE_SMS_OTP', 'True') == 'True'
if enable_sms:
    # Find a user with phone number
    user_with_phone = CustomUser.objects.filter(phone__isnull=False).exclude(phone='').first()
    if user_with_phone:
        try:
            result = send_sms_otp.delay(
                user_with_phone.phone,
                'OTP System Test: Your test code is 123456'
            )
            print(f"✓ SMS task queued successfully")
            print(f"  Task ID: {result.id}")
            print(f"  Phone: {user_with_phone.phone}")
            print(f"  Check Celery logs to see if it executes")
            print(f"  ⚠️  Remember: Twilio trial can only send to verified numbers")
        except Exception as e:
            print(f"✗ Failed to queue SMS task: {str(e)}")
            print("  Make sure Celery worker is running!")
    else:
        print("⚠️  No users with phone numbers found in database")
else:
    print("⚠️  SMS is disabled (ENABLE_SMS_OTP=False)")

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print("\nIf you see task IDs above, the tasks are queued.")
print("Now check your Celery worker terminal to see if they execute.")
print("\nExpected Celery output:")
print("  [INFO] Task authentication.tasks.send_verification_email[xxx] received")
print("  ✓ Verification email sent to ...")
print("\nIf you see PermissionError, restart Celery with --pool=solo")
print("\nNext steps:")
print("1. Check Celery logs for task execution")
print("2. Check your email inbox")
print("3. If SMS enabled, check your phone")
print("4. Try login/registration from the frontend")
print("=" * 70)
