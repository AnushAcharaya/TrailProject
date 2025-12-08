# SMS OTP Setup Guide

## Current Status

✅ **Email OTP**: Working perfectly  
❌ **SMS OTP**: Blocked by Twilio (Error 30454)

## Problem

Your Twilio trial account doesn't have geographic permissions enabled for Nepal (+977). This prevents SMS from being delivered to Nepali phone numbers.

## Solutions

### Option 1: Enable Geographic Permissions (Recommended for Production)

1. Go to Twilio Console: https://console.twilio.com/us1/develop/sms/settings/geo-permissions
2. Find **Nepal** in the country list
3. Check the box to enable SMS permissions for Nepal
4. Click "Save"
5. Update `.env` file: Set `ENABLE_SMS_OTP=True`
6. Restart your Django and Celery servers
7. Test SMS sending again

**Note**: Some trial accounts may have restrictions on international SMS. You might need to:
- Add credit to your account
- Upgrade to a paid account
- Contact Twilio support

### Option 2: Development Mode (Current Setup)

For development purposes, both OTPs (email and phone) are now sent via email:

- **Email OTP**: Sent to user's email
- **Phone OTP**: Also sent to user's email (when `ENABLE_SMS_OTP=False`)

This allows you to test the complete registration flow without SMS.

**Configuration**:
```env
ENABLE_SMS_OTP=False  # Both OTPs sent via email
```

### Option 3: Use a Different SMS Provider

Consider alternatives that support Nepal:
- **Twilio** (after enabling geo-permissions)
- **Vonage (Nexmo)**
- **AWS SNS**
- **Local Nepali SMS providers** (Sparrow SMS, etc.)

## Testing

### Test Email OTP
```bash
# Register a new user
# Check email for: "Your email verification code is: XXXXXX"
```

### Test Phone OTP (Development Mode)
```bash
# Register a new user
# Check email for: "Your phone verification code is: XXXXXX"
```

### Test SMS OTP (After Enabling Geo-Permissions)
```bash
# Set ENABLE_SMS_OTP=True in .env
# Restart servers
# Register a new user
# Check phone for SMS
```

## Verification

Run this command to check Twilio status:
```bash
python check_twilio_status.py
```

Run this to check for errors:
```bash
python check_twilio_error.py
```

## Current Configuration

- Email Backend: Gmail SMTP ✅
- Email OTP: Working ✅
- SMS Provider: Twilio (Trial Account)
- SMS OTP: Disabled (Geographic restriction)
- Development Mode: Both OTPs via email ✅

## Next Steps

1. **For Development**: Continue using email for both OTPs (current setup)
2. **For Production**: 
   - Enable Nepal in Twilio geo-permissions
   - Consider upgrading Twilio account
   - Or switch to a local SMS provider
