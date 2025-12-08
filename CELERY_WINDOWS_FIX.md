# Complete Fix for Celery on Windows - OTP Email Not Sending

## Problem
Celery on Windows has PermissionErrors with the default `prefork` pool, preventing email tasks from being executed.

## Solution

### Step 1: Stop Current Celery Worker
Press `Ctrl+C` in the Celery terminal to stop it.

### Step 2: Start Celery with Solo Pool
Run this command instead:

```bash
celery -A backend worker --pool=solo --loglevel=info
```

### Step 3: Verify It's Working
You should see:
```
-------------- celery@LAPTOP-UC1M90CM v5.5.3 (immunity)
...
.> concurrency: 1 (solo)
...
[tasks]
  . authentication.tasks.send_sms_otp
  . authentication.tasks.send_verification_email

celery@LAPTOP-UC1M90CM ready.
```

**Key difference:** `.> concurrency: 1 (solo)` instead of `.> concurrency: 20 (prefork)`

### Step 4: Test Registration
1. Go to: http://localhost:5173/create-account
2. Fill in the form
3. Click "Create Account"
4. **Watch the Celery terminal** - you should now see:
   ```
   [INFO] Task authentication.tasks.send_verification_email[...] received
   [INFO] Task authentication.tasks.send_verification_email[...] succeeded
   ✓ Verification email sent to user@example.com
   ```

### Step 5: Check Email
- Check your email inbox
- Check spam/junk folder
- Wait 1-2 minutes for delivery

## Why This Works

- **prefork pool:** Uses multiple processes (doesn't work on Windows)
- **solo pool:** Uses single process (works perfectly on Windows)

## Alternative: Use Gevent Pool

If solo pool doesn't work, try gevent:

```bash
pip install gevent
celery -A backend worker --pool=gevent --concurrency=10 --loglevel=info
```

## Permanent Fix

To make this permanent, create a batch file `start_celery.bat`:

```batch
@echo off
celery -A backend worker --pool=solo --loglevel=info
```

Then just run: `start_celery.bat`

## Troubleshooting

### If you still don't see tasks being processed:

1. **Check Redis is running:**
   - Celery logs should show: `Connected to redis://localhost:6379/0`

2. **Check email configuration:**
   ```bash
   python test_email_connection.py
   ```

3. **Check if tasks are being created:**
   ```bash
   python diagnose_login_otp.py
   ```

### If emails still don't arrive:

1. Check Gmail spam folder
2. Verify Gmail App Password is correct
3. Try sending test email:
   ```bash
   python test_email_connection.py
   ```
