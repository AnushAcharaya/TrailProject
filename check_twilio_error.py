from twilio.rest import Client
from decouple import config

# Twilio credentials
account_sid = config('TWILIO_ACCOUNT_SID')
auth_token = config('TWILIO_AUTH_TOKEN')

client = Client(account_sid, auth_token)

print("=" * 60)
print("CHECKING FAILED MESSAGES")
print("=" * 60)

# Get recent failed messages
messages = client.messages.list(limit=10)

for msg in messages:
    if msg.status == 'failed':
        print(f"\nMessage SID: {msg.sid}")
        print(f"To: {msg.to}")
        print(f"From: {msg.from_}")
        print(f"Status: {msg.status}")
        print(f"Error Code: {msg.error_code}")
        print(f"Error Message: {msg.error_message}")
        print(f"Body: {msg.body[:100] if msg.body else 'N/A'}")
        print("-" * 60)

print("\n" + "=" * 60)
print("ERROR CODE 30454 EXPLANATION")
print("=" * 60)
print("""
Error 30454: Message blocked

This error occurs when:
1. The destination country doesn't allow SMS from your Twilio number
2. Geographic permissions are not enabled for that country
3. The phone number type doesn't support SMS

SOLUTION:
1. Go to: https://console.twilio.com/us1/develop/sms/settings/geo-permissions
2. Enable SMS permissions for Nepal (+977)
3. Make sure your Twilio number supports SMS to Nepal

Alternative: Use a different Twilio number that supports international SMS
or upgrade your account.
""")
