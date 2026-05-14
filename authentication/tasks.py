from celery import shared_task
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings

@shared_task
def send_verification_email(email, subject, message):
    """Send verification email using branded LHMMS template."""
    from .email_utils import send_email_sync
    send_email_sync(email, subject, message)
    print(f"✓ Verification email sent to {email}")
    return True

@shared_task
def send_sms_otp(phone, message):
    """
    Send SMS OTP using Twilio SMS API (not Verify API)
    This sends our custom OTP code from the database
    """
    from twilio.rest import Client
    from decouple import config
    import os
    
    # Development mode - print OTP to console instead of sending SMS
    if os.getenv('SMS_DEV_MODE', 'False') == 'True':
        print("=" * 60)
        print("📱 SMS DEVELOPMENT MODE")
        print("=" * 60)
        print(f"To: {phone}")
        print(f"Message: {message}")
        print("=" * 60)
        return "DEV_MODE_SUCCESS"
    
    try:
        account_sid = config('TWILIO_ACCOUNT_SID')
        auth_token = config('TWILIO_AUTH_TOKEN')
        twilio_phone = config('TWILIO_PHONE_NUMBER')
        
        client = Client(account_sid, auth_token)
        
        # Send SMS with our custom OTP code
        sms_message = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=phone
        )
        
        print(f"✓ SMS OTP sent successfully to {phone}")
        print(f"  Status: {sms_message.status}")
        print(f"  SID: {sms_message.sid}")
        return sms_message.sid
        
    except Exception as e:
        print(f"✗ Failed to send SMS to {phone}: {str(e)}")
        # In development, still print the OTP so testing can continue
        print(f"📱 OTP for {phone}: {message}")
        return None


def send_reset_token_email(user, token):
    """Send branded password reset email."""
    from .email_utils import send_password_reset_email
    send_password_reset_email(user, token)
    print(f"✓ Password reset email sent to {user.email}")
