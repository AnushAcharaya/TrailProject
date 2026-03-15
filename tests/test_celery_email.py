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

def test_celery_task():
    """Test if Celery task can send email"""
    print("=" * 50)
    print("Testing Celery Email Task")
    print("=" * 50)
    
    test_email = settings.EMAIL_HOST_USER
    subject = "Test Email - Celery Task"
    message = "This is a test email sent through Celery task."
    
    print(f"Sending email to: {test_email}")
    print(f"Subject: {subject}")
    print()
    
    try:
        # Try synchronous call first
        print("1. Testing synchronous call (without Celery)...")
        result = send_verification_email(test_email, subject, message)
        print(f"✓ Synchronous call successful!")
        print()
        
        # Try async call (requires Celery worker)
        print("2. Testing asynchronous call (with Celery)...")
        print("   Note: This requires Celery worker to be running!")
        task = send_verification_email.delay(test_email, subject + " (Async)", message)
        print(f"   Task ID: {task.id}")
        print(f"   Task State: {task.state}")
        
        # Wait for result
        print("   Waiting for task to complete...")
        result = task.get(timeout=10)
        print(f"✓ Asynchronous call successful!")
        print(f"   Result: {result}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        print()
        print("Possible issues:")
        print("1. Celery worker is not running")
        print("2. Redis is not running")
        print("3. Email configuration issue")
        print()
        print("To start Celery worker, run:")
        print("   celery -A backend worker --loglevel=info --pool=solo")
        return False

if __name__ == '__main__':
    print("\n🔍 Celery Email Task Diagnostic Tool\n")
    test_celery_task()
