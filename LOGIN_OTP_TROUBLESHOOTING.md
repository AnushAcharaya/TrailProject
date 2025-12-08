# Login OTP Troubleshooting Guide

## Complete Flow Analysis

### Frontend → Backend Flow

```
1. User fills form → Clicks "Send OTP"
   ↓
2. Login.jsx → handleSubmit()
   ↓
3. api.js → sendLoginOTP(formData)
   ↓
4. POST http://localhost:8000/api/v1/auth/login/send-otp/
   ↓
5. Backend: SendLoginOTPView
   ↓
6. Validates: email, password, role, approval status
   ↓
7. Creates LoginOTP object (generates email_code & phone_code)
   ↓
8. Sends email OTP via Celery: send_verification_email.delay()
   ↓
9. For farmer/vet: Sends phone OTP
   - If ENABLE_SMS_OTP=True: via send_sms_otp.delay()
   - If ENABLE_SMS_OTP=False: via email
   ↓
10. Returns success response
   ↓
11. Frontend moves to Step 2 (OTP verification screen)
```

## Root Cause of "Not Receiving OTP"

### Issue #1: Missing ENABLE_SMS_OTP Variable
**Problem:** The `.env` file was missing `ENABLE_SMS_OTP` variable, causing the code to default to `True` and attempt SMS sending.

**Solution:** Added `ENABLE_SMS_OTP=False` to `.env` file.

### Issue #2: Twilio Verify API Mismatch
**Problem:** When using Twilio Verify API, Twilio generates its own OTP code, which doesn't match the codes stored in your database.

**Solution:** Updated `send_sms_otp` task to use Twilio SMS API instead of Verify API, so it sends the OTP code from your database.

### Issue #3: Celery Worker Not Running
**Problem:** If Celery worker is not running, emails won't be sent.

**Check:**
```bash
# Check if Celery is running
celery -A backend worker --loglevel=info
```

### Issue #4: Redis Not Running
**Problem:** Celery requires Redis as a message broker.

**Check:**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

## Configuration Options

### Option 1: Development Mode (Email Only)
**Best for testing without SMS**

```env
ENABLE_SMS_OTP=False
SMS_DEV_MODE=False
```

- Email OTP: Sent via email ✓
- Phone OTP: Sent via email ✓
- No SMS charges
- Easy to test

### Option 2: Development Mode (Console Only)
**Best for local development**

```env
ENABLE_SMS_OTP=True
SMS_DEV_MODE=True
```

- Email OTP: Sent via email ✓
- Phone OTP: Printed to console ✓
- No SMS charges
- Check Celery worker logs for OTP

### Option 3: Production Mode (Real SMS)
**For production with Twilio**

```env
ENABLE_SMS_OTP=True
SMS_DEV_MODE=False
```

- Email OTP: Sent via email ✓
- Phone OTP: Sent via Twilio SMS ✓
- SMS charges apply
- Requires valid Twilio credentials

## Testing Checklist

### 1. Check Django Server
```bash
python manage.py runserver
# Should be running on http://localhost:8000
```

### 2. Check Celery Worker
```bash
celery -A backend worker --loglevel=info
# Should show: [tasks] and be ready
```

### 3. Check Redis
```bash
redis-cli ping
# Should return: PONG
```

### 4. Check Database Migration
```bash
python manage.py migrate
# Should show: LoginOTP model migrated
```

### 5. Test Login OTP Flow
```bash
python test_login_otp.py
```

## Common Errors and Solutions

### Error: "No OTP found. Please request a new one"
**Cause:** OTP not created in database
**Solution:** 
- Check Celery worker logs
- Verify SendLoginOTPView is creating LoginOTP object
- Check database: `SELECT * FROM authentication_loginotp;`

### Error: "OTP has expired"
**Cause:** OTP older than 10 minutes
**Solution:** Request new OTP

### Error: "Invalid email OTP" or "Invalid phone OTP"
**Cause:** Wrong OTP code entered
**Solution:** 
- Check email inbox
- Check Celery worker console logs
- If ENABLE_SMS_OTP=False, check email for phone OTP too

### Error: "Your account is pending admin approval"
**Cause:** User status is 'pending'
**Solution:** Admin must approve the user first

### Error: "Invalid credentials"
**Cause:** Wrong email, phone, password, or role
**Solution:** Verify credentials match database

## Debugging Steps

### 1. Check if OTP is created in database
```sql
-- Connect to PostgreSQL
psql -U postgres -d authentication

-- Check latest LoginOTP
SELECT id, user_id, email_code, phone_code, created_at, used 
FROM authentication_loginotp 
ORDER BY created_at DESC 
LIMIT 5;
```

### 2. Check Celery worker logs
Look for:
```
✓ Verification email sent to user@example.com
📱 SMS OTP sent successfully to +1234567890
```

### 3. Check Django console logs
Look for:
```
[POST] /api/v1/auth/login/send-otp/
Response: 200 OK
```

### 4. Check browser console (F12)
Look for:
```javascript
POST http://localhost:8000/api/v1/auth/login/send-otp/
Status: 200
Response: {success: true, message: "OTP sent successfully"}
```

### 5. Check email inbox
- Check spam/junk folder
- Wait 1-2 minutes for email delivery
- Verify EMAIL_HOST_PASSWORD is correct in .env

## Current Configuration

After fixes applied:

```env
# Email OTP: Sent via email ✓
# Phone OTP: Sent via email ✓ (ENABLE_SMS_OTP=False)
# No SMS charges
# Easy to test
```

## Next Steps

1. **Restart services:**
   ```bash
   # Stop Django server (Ctrl+C)
   # Stop Celery worker (Ctrl+C)
   
   # Start Redis (if not running)
   redis-server
   
   # Start Celery worker
   celery -A backend worker --loglevel=info
   
   # Start Django server
   python manage.py runserver
   ```

2. **Test login flow:**
   - Go to http://localhost:5173/login
   - Select role (admin/farmer/vet)
   - Enter credentials
   - Click "Send OTP"
   - Check email inbox for BOTH email OTP and phone OTP
   - Enter OTPs and verify

3. **Check logs:**
   - Celery worker terminal: Should show email sending
   - Django server terminal: Should show API requests
   - Browser console: Should show successful responses

## Support

If issues persist:
1. Check all services are running (Django, Celery, Redis)
2. Verify .env configuration
3. Check database for LoginOTP records
4. Review Celery worker logs for errors
5. Test with `test_login_otp.py` script
