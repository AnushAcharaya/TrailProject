"""
Simple email utilities without Celery dependency
"""
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def send_email_sync(email, subject, message):
    """Send email synchronously without Celery"""
    try:
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #2c3e50;">{subject}</h2>
                    <p>{message}</p>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        msg = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        msg.attach_alternative(html_message, "text/html")
        msg.send(fail_silently=False)
        print(f"✓ Email sent to {email}")
        return True
    except Exception as e:
        print(f"✗ Email failed: {str(e)}")
        print(f"📧 Email OTP for {email}:")
        print(f"Subject: {subject}")
        print(f"Message: {message}")
        print("=" * 60)
        # Don't raise the exception - allow the flow to continue
        return False


def send_sms_sync(phone, message):
    """Send SMS synchronously without Celery"""
    import os
    
    # Development mode - print to console
    if os.getenv('SMS_DEV_MODE', 'False') == 'True' or not os.getenv('TWILIO_ACCOUNT_SID'):
        print("=" * 60)
        print("📱 SMS DEVELOPMENT MODE")
        print("=" * 60)
        print(f"To: {phone}")
        print(f"Message: {message}")
        print("=" * 60)
        return "DEV_MODE_SUCCESS"
    
    # Production mode - use Twilio
    try:
        from twilio.rest import Client
        from decouple import config
        
        account_sid = config('TWILIO_ACCOUNT_SID')
        auth_token = config('TWILIO_AUTH_TOKEN')
        twilio_phone = config('TWILIO_PHONE_NUMBER')
        
        client = Client(account_sid, auth_token)
        sms_message = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=phone
        )
        print(f"✓ SMS sent to {phone} (SID: {sms_message.sid})")
        return sms_message.sid
    except Exception as e:
        print(f"✗ SMS failed: {str(e)}")
        print(f"📱 OTP for {phone}: {message}")
        return None
