"""
Email utilities — branded templates for LHMMS.
All outgoing emails use build_email_html() for consistent branding.
"""
import html as _html
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


# ─────────────────────────────────────────────
#  MASTER TEMPLATE BUILDER
# ─────────────────────────────────────────────

def build_email_html(heading, body_html, footer_note=None):
    """Return a fully branded HTML email string."""
    if footer_note is None:
        footer_note = "This is an automated message — please do not reply to this email."
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{_html.escape(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;
                    overflow:hidden;box-shadow:0 6px 32px rgba(0,0,0,0.10);">

        <!-- ── LOGO HEADER ── -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B5E20 0%,#2E7D32 55%,#388E3C 100%);
                     padding:32px 40px 26px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <!-- Icon circle -->
                  <div style="display:inline-block;background:rgba(255,255,255,0.18);
                               border-radius:50%;width:68px;height:68px;line-height:68px;
                               font-size:36px;text-align:center;margin-bottom:14px;">
                    🐄
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <span style="color:#ffffff;font-size:26px;font-weight:700;
                                letter-spacing:3px;display:block;">LHMMS</span>
                  <span style="color:rgba(255,255,255,0.80);font-size:11px;
                                letter-spacing:0.6px;display:block;margin-top:4px;">
                    Livestock Health Management &amp; Monitoring System
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── COLOUR ACCENT BAR ── -->
        <tr>
          <td style="background:linear-gradient(90deg,#4CAF50,#81C784);height:4px;padding:0;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- ── MAIN CONTENT ── -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <h2 style="margin:0 0 20px;color:#1B5E20;font-size:20px;font-weight:700;">
              {_html.escape(heading)}
            </h2>
            {body_html}
          </td>
        </tr>

        <!-- ── FOOTER NOTE ── -->
        <tr>
          <td style="padding:0 40px 24px;">
            <p style="margin:0;font-size:12px;color:#9E9E9E;
                       border-top:1px solid #EEEEEE;padding-top:16px;">
              {_html.escape(footer_note)}
            </p>
          </td>
        </tr>

        <!-- ── DARK FOOTER ── -->
        <tr>
          <td style="background:#1B5E20;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.75);font-size:12px;">
              &copy; 2026 LHMMS &nbsp;&bull;&nbsp;
              Livestock Health Management &amp; Monitoring System
            </p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.50);font-size:11px;">
              Nepal &nbsp;&bull;&nbsp; Support: support@lhmms.np
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""


# ─────────────────────────────────────────────
#  SPECIFIC EMAIL SENDERS
# ─────────────────────────────────────────────

def _dispatch(email, subject, plain_text, html_body):
    """Low-level send via Django's EmailMultiAlternatives."""
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
        print(f"[OK] Email sent to {email} — {subject}")
        return True
    except Exception as exc:
        print(f"[FAIL] Email failed for {email}: {exc}")
        print(f"  Subject : {subject}")
        print(f"  Body    : {plain_text}")
        return False


def send_email_sync(email, subject, message):
    """
    Generic branded email. Converts plain-text message to HTML paragraphs.
    All existing callers continue to work unchanged.
    """
    paragraphs = "".join(
        f'<p style="margin:0 0 14px;color:#424242;font-size:15px;line-height:1.7;">'
        f'{_html.escape(line)}</p>'
        for line in message.split("\n") if line.strip()
    )
    body_html = paragraphs
    html = build_email_html(subject, body_html)
    return _dispatch(email, subject, message, html)


def send_otp_email(email, user_name, code, heading="Verification Code", expires="10 minutes"):
    """Styled OTP email with a large code box."""
    plain = f"Hello {user_name},\n\nYour code is: {code}\n\nExpires in {expires}."
    body_html = f"""
    <p style="margin:0 0 12px;color:#424242;font-size:15px;line-height:1.7;">
      Hello <strong>{_html.escape(user_name)}</strong>,
    </p>
    <p style="margin:0 0 20px;color:#424242;font-size:15px;line-height:1.7;">
      Use the code below to complete your request. Do not share it with anyone.
    </p>

    <!-- OTP Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      <tr>
        <td align="center"
            style="background:#F0FDF4;border:2px dashed #4CAF50;border-radius:12px;padding:28px 20px;">
          <span style="font-size:44px;font-weight:700;letter-spacing:12px;color:#1B5E20;
                        font-family:'Courier New',Courier,monospace;">
            {_html.escape(str(code))}
          </span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;color:#757575;font-size:13px;">
      &#x23F1; This code expires in <strong>{_html.escape(expires)}</strong>.
    </p>
    """
    html = build_email_html(
        heading,
        body_html,
        footer_note="If you didn't request this code, please ignore this email and your account will remain safe."
    )
    return _dispatch(email, heading, plain, html)


def send_password_reset_email(user, token):
    """Branded password reset email with token box."""
    full_name = getattr(user, 'full_name', None) or user.username
    plain = (
        f"Hello {full_name},\n\n"
        f"Password reset token: {token}\n\n"
        f"This token is valid for 30 minutes."
    )
    body_html = f"""
    <p style="margin:0 0 12px;color:#424242;font-size:15px;line-height:1.7;">
      Hello <strong>{_html.escape(full_name)}</strong>,
    </p>
    <p style="margin:0 0 20px;color:#424242;font-size:15px;line-height:1.7;">
      We received a request to reset your password. Use the token below:
    </p>

    <!-- Token Box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      <tr>
        <td align="center"
            style="background:#F0FDF4;border:2px dashed #4CAF50;border-radius:12px;padding:24px 20px;">
          <span style="font-size:22px;font-weight:700;letter-spacing:3px;color:#1B5E20;
                        word-break:break-all;font-family:'Courier New',Courier,monospace;">
            {_html.escape(str(token))}
          </span>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="background:#FFF3E0;border-left:4px solid #FF9800;
                   border-radius:0 8px 8px 0;padding:12px 16px;">
          <p style="margin:0;color:#E65100;font-size:13px;font-weight:600;">
            &#x26A0; This token expires in <strong>30 minutes</strong>.
            Never share it with anyone.
          </p>
        </td>
      </tr>
    </table>
    """
    html = build_email_html(
        "Password Reset Request",
        body_html,
        footer_note="If you didn't request a password reset, please ignore this email. Your account is safe."
    )
    return _dispatch(user.email, "Password Reset Request — LHMMS", plain, html)


def send_account_approved_email(user):
    """Account approval notification."""
    full_name = getattr(user, 'full_name', None) or user.username
    role_label = (getattr(user, 'role', None) or 'user').capitalize()
    plain = (
        f"Hello {full_name},\n\n"
        f"Your LHMMS account has been approved. You can now sign in as a {role_label}.\n\n"
        f"Sign in at: http://localhost:5173/login"
    )
    body_html = f"""
    <p style="margin:0 0 16px;color:#424242;font-size:15px;line-height:1.7;">
      Hello <strong>{_html.escape(full_name)}</strong>,
    </p>

    <!-- Success banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#F0FDF4;border:1px solid #A5D6A7;border-left:5px solid #4CAF50;
                   border-radius:0 10px 10px 0;padding:16px 20px;">
          <p style="margin:0;color:#1B5E20;font-size:15px;font-weight:600;">
            &#x2705; Your account has been <strong>approved</strong>!
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 14px;color:#424242;font-size:15px;line-height:1.7;">
      An administrator has verified your information and your LHMMS account is now active.
      You can sign in as a <strong>{_html.escape(role_label)}</strong> using your registered email and password.
    </p>

    <!-- CTA Button -->
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background:linear-gradient(135deg,#1B5E20,#388E3C);
                                   border-radius:8px;padding:0;">
          <a href="http://localhost:5173/login"
             style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;
                    font-weight:700;text-decoration:none;letter-spacing:0.5px;">
            Sign In to LHMMS &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;color:#757575;font-size:13px;">
      Welcome to the LHMMS community. If you have questions, contact our support team.
    </p>
    """
    html = build_email_html(
        "Your account has been approved!",
        body_html,
        footer_note="You are receiving this email because your LHMMS account was reviewed by an administrator."
    )
    return _dispatch(user.email, "Your LHMMS Account Has Been Approved ✅", plain, html)


def send_account_declined_email(user):
    """Account decline notification."""
    full_name = getattr(user, 'full_name', None) or user.username
    plain = (
        f"Hello {full_name},\n\n"
        f"We're sorry — your LHMMS account could not be approved at this time.\n\n"
        f"If you believe this is a mistake, please contact LHMMS support."
    )
    body_html = f"""
    <p style="margin:0 0 16px;color:#424242;font-size:15px;line-height:1.7;">
      Hello <strong>{_html.escape(full_name)}</strong>,
    </p>

    <!-- Warning banner -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#FFF8E1;border:1px solid #FFE082;border-left:5px solid #FFA000;
                   border-radius:0 10px 10px 0;padding:16px 20px;">
          <p style="margin:0;color:#E65100;font-size:15px;font-weight:600;">
            &#x26A0; Your account verification was <strong>not approved</strong>.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 14px;color:#424242;font-size:15px;line-height:1.7;">
      An administrator was unable to approve your account at this time. This usually happens when:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#424242;font-size:14px;line-height:1.8;">
      <li>Submitted documents could not be verified</li>
      <li>Some information needed further clarification</li>
    </ul>
    <p style="margin:0 0 14px;color:#424242;font-size:15px;line-height:1.7;">
      If you believe this was a mistake, please contact our support team and we will be happy to help.
    </p>
    <p style="margin:0;color:#757575;font-size:13px;">
      &#x1F4E7; support@lhmms.np
    </p>
    """
    html = build_email_html(
        "Account Verification Update",
        body_html,
        footer_note="You are receiving this email because your LHMMS account was reviewed by an administrator."
    )
    return _dispatch(user.email, "Your LHMMS Account Verification Status", plain, html)


def send_sms_sync(phone, message):
    """Send SMS synchronously without Celery."""
    import os
    if os.getenv('SMS_DEV_MODE', 'False') == 'True' or not os.getenv('TWILIO_ACCOUNT_SID'):
        print("=" * 60)
        print("[SMS] SMS DEVELOPMENT MODE")
        print(f"To: {phone}")
        print(f"Message: {message}")
        print("=" * 60)
        return "DEV_MODE_SUCCESS"
    try:
        from twilio.rest import Client
        from decouple import config
        client = Client(config('TWILIO_ACCOUNT_SID'), config('TWILIO_AUTH_TOKEN'))
        sms = client.messages.create(body=message, from_=config('TWILIO_PHONE_NUMBER'), to=phone)
        print(f"[OK] SMS sent to {phone} (SID: {sms.sid})")
        return sms.sid
    except Exception as exc:
        print(f"[FAIL] SMS failed for {phone}: {exc}")
        return None
