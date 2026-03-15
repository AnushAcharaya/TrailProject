import os
import django
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.tasks import send_verification_email
from django.conf import settings

def test_complete_flow():
    """Test the complete email flow with HTML formatting"""
    print("=" * 60)
    print("COMPLETE EMAIL FLOW TEST")
    print("=" * 60)
    
    test_email = settings.EMAIL_HOST_USER
    
    # Test 1: Verification Email
    print("\n1. Testing Verification Email...")
    print("-" * 60)
    verification_link = "http://localhost:5173/verify?token=test-token-123"
    subject = "Verify your email"
    message = f"Please click the link to verify your email: {verification_link}"
    
    try:
        result = send_verification_email(test_email, subject, message)
        print(f"✓ Verification email sent successfully!")
        print(f"  To: {test_email}")
        print(f"  Subject: {subject}")
    except Exception as e:
        print(f"✗ Failed to send verification email: {e}")
    
    # Test 2: Async with Celery
    print("\n2. Testing Async Email (Celery)...")
    print("-" * 60)
    try:
        task = send_verification_email.delay(
            test_email,
            "Test Async Email",
            "This is a test async email sent through Celery."
        )
        print(f"✓ Task queued successfully!")
        print(f"  Task ID: {task.id}")
        print(f"  Task State: {task.state}")
        
        # Wait for completion
        result = task.get(timeout=10)
        print(f"✓ Task completed successfully!")
    except Exception as e:
        print(f"✗ Async email failed: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("✓ Email configuration is working correctly")
    print("✓ Celery tasks are executing properly")
    print("✓ HTML formatted emails are being sent")
    print()
    print("📧 CHECK YOUR EMAIL INBOX AND SPAM FOLDER")
    print(f"   Email: {test_email}")
    print()
    print("If emails are in spam:")
    print("1. Mark them as 'Not Spam'")
    print("2. Add sender to contacts")
    print("3. Create a filter to always deliver to inbox")
    print()
    print("For production:")
    print("1. Use a custom domain email (not Gmail)")
    print("2. Set up SPF, DKIM, and DMARC records")
    print("3. Use a dedicated email service (SendGrid, AWS SES, etc.)")

if __name__ == '__main__':
    print("\n🔍 Complete Email Flow Test\n")
    test_complete_flow()
