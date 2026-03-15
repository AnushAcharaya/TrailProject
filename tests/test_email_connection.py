import os
import django
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
import smtplib
from email.mime.text import MIMEText

def test_smtp_connection():
    """Test direct SMTP connection"""
    print("=" * 50)
    print("Testing SMTP Connection")
    print("=" * 50)
    
    email_host = os.getenv('EMAIL_HOST')
    email_port = int(os.getenv('EMAIL_PORT', 587))
    email_user = os.getenv('EMAIL_HOST_USER')
    email_password = os.getenv('EMAIL_HOST_PASSWORD')
    
    print(f"Host: {email_host}")
    print(f"Port: {email_port}")
    print(f"User: {email_user}")
    print(f"Password: {'*' * len(email_password) if email_password else 'NOT SET'}")
    print()
    
    try:
        # Create SMTP connection
        server = smtplib.SMTP(email_host, email_port)
        server.set_debuglevel(1)  # Enable debug output
        server.starttls()
        
        print("\nAttempting login...")
        server.login(email_user, email_password)
        print("✓ Login successful!")
        
        # Send test email
        msg = MIMEText("This is a test email from your Django app.")
        msg['Subject'] = 'Test Email - SMTP Direct'
        msg['From'] = email_user
        msg['To'] = email_user  # Send to yourself
        
        print(f"\nSending test email to {email_user}...")
        server.send_message(msg)
        print("✓ Email sent successfully!")
        
        server.quit()
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"\n✗ Authentication failed: {e}")
        print("\nPossible issues:")
        print("1. App password is incorrect")
        print("2. 2-Step Verification not enabled on Gmail")
        print("3. App password not generated correctly")
        return False
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False

def test_django_email():
    """Test Django email sending"""
    print("\n" + "=" * 50)
    print("Testing Django Email")
    print("=" * 50)
    
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print()
    
    try:
        result = send_mail(
            subject='Test Email - Django',
            message='This is a test email sent through Django.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
            fail_silently=False,
        )
        
        if result == 1:
            print("✓ Django email sent successfully!")
            return True
        else:
            print("✗ Django email failed to send")
            return False
            
    except Exception as e:
        print(f"✗ Error sending Django email: {e}")
        return False

if __name__ == '__main__':
    print("\n🔍 Email Configuration Diagnostic Tool\n")
    
    # Test 1: Direct SMTP
    smtp_success = test_smtp_connection()
    
    # Test 2: Django email
    django_success = test_django_email()
    
    # Summary
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"SMTP Connection: {'✓ PASS' if smtp_success else '✗ FAIL'}")
    print(f"Django Email: {'✓ PASS' if django_success else '✗ FAIL'}")
    
    if not smtp_success:
        print("\n📋 Next Steps:")
        print("1. Go to https://myaccount.google.com/security")
        print("2. Enable 2-Step Verification if not already enabled")
        print("3. Go to https://myaccount.google.com/apppasswords")
        print("4. Generate a new App Password for 'Mail'")
        print("5. Update EMAIL_HOST_PASSWORD in .env with the new password")
        print("6. Run this test again")
