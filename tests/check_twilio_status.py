from twilio.rest import Client
from decouple import config

# Twilio credentials
account_sid = config('TWILIO_ACCOUNT_SID')
auth_token = config('TWILIO_AUTH_TOKEN')
twilio_number = config('TWILIO_PHONE_NUMBER')

client = Client(account_sid, auth_token)

print("=" * 60)
print("TWILIO ACCOUNT STATUS")
print("=" * 60)

# Get account info
account = client.api.accounts(account_sid).fetch()
print(f"Account SID: {account.sid}")
print(f"Account Status: {account.status}")
print(f"Account Type: {account.type}")
print()

# Check if trial account
if account.type == 'Trial':
    print("⚠️  YOU ARE USING A TRIAL ACCOUNT")
    print()
    print("Trial Account Restrictions:")
    print("1. Can only send SMS to VERIFIED phone numbers")
    print("2. All messages include 'Sent from your Twilio trial account' prefix")
    print("3. Limited number of messages")
    print()
    print("To receive SMS on +9779849888438:")
    print("1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified")
    print("2. Click 'Add a new number'")
    print("3. Enter: +9779849888438")
    print("4. Verify via SMS or voice call")
    print()
    print("OR upgrade your account to send to any number:")
    print("https://console.twilio.com/us1/billing/manage-billing/upgrade")
else:
    print("✓ You have a full Twilio account")

print()
print("=" * 60)
print("VERIFIED PHONE NUMBERS")
print("=" * 60)

# List verified phone numbers (for trial accounts)
try:
    outgoing_caller_ids = client.outgoing_caller_ids.list()
    if outgoing_caller_ids:
        for caller_id in outgoing_caller_ids:
            print(f"✓ {caller_id.phone_number} - {caller_id.friendly_name}")
    else:
        print("No verified phone numbers found")
        print()
        print("Add verified numbers at:")
        print("https://console.twilio.com/us1/develop/phone-numbers/manage/verified")
except Exception as e:
    print(f"Could not fetch verified numbers: {e}")

print()
print("=" * 60)
print("RECENT MESSAGES")
print("=" * 60)

# Get recent messages
messages = client.messages.list(limit=5)
for msg in messages:
    status_icon = "✓" if msg.status == "delivered" else "✗" if msg.status == "failed" else "⏳"
    print(f"{status_icon} To: {msg.to}")
    print(f"   Status: {msg.status}")
    print(f"   Date: {msg.date_created}")
    if msg.error_code:
        print(f"   Error: {msg.error_code} - {msg.error_message}")
    print()
