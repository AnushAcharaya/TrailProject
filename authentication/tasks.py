from celery import shared_task
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings

@shared_task
def send_verification_email(email, subject, message):
    """Send verification email with HTML formatting for better deliverability"""
    # Create HTML version for better deliverability
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #2c3e50;">Email Verification</h2>
                <p>{message}</p>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    If you didn't request this, please ignore this email.
                </p>
            </div>
        </body>
    </html>
    """
    
    # Send both plain text and HTML versions
    msg = EmailMultiAlternatives(
        subject=subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email]
    )
    msg.attach_alternative(html_message, "text/html")
    msg.send(fail_silently=False)
    
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
    """Send password reset email with HTML formatting"""
    subject = "Password Reset Request"
    message = f"Hello {user.full_name},\n\nUse the following token to reset your password: {token}\n\nThis token is valid for 30 minutes."
    
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #2c3e50;">Password Reset Request</h2>
                <p>Hello <strong>{user.full_name}</strong>,</p>
                <p>Use the following token to reset your password:</p>
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">
                    {token}
                </div>
                <p style="color: #e74c3c;"><strong>This token is valid for 30 minutes.</strong></p>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    If you didn't request this password reset, please ignore this email.
                </p>
            </div>
        </body>
    </html>
    """
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email]
    )
    msg.attach_alternative(html_message, "text/html")
    msg.send(fail_silently=False)
    
    print(f"✓ Password reset email sent to {user.email}")
