from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_verification_email(email, subject, message):
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)

@shared_task
def send_sms_otp(phone, message):
    # Integrate your SMS provider here
    print(f"Send SMS to {phone}: {message}")


def send_reset_token_email(user, token):
    subject = "Password Reset Request"
    message = f"Hello {user.full_name},\n\nUse the following token to reset your password: {token}\n\nThis token is valid for 30 minutes."
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
