"""
Test Twilio SMS sending capability
"""
from twilio.rest import Client
from decouple import config

print("=" * 60)
print("TESTING TWILIO SMS CONFIGURATION")
print("=" * 60)

try:
    # Get credentials
    account_sid = config('TWILIO_ACCOUNT_SID')
    auth_token = config('TWILIO_AUTH_TOKEN')
    twilio_phone = config('TWILIO_PHONE_NUMBER')
    
    print(f"\n✓ Account SID: {account_sid}")
    print(f"✓ Twilio Phone: {twilio_phone}")
    
    # Create client
    client = Client(account_sid, auth_token)
    
    # Get account info
    account = client.api.accounts(account_sid).fetch()
    print(f"✓ Account Status: {account.status}")
    print(f"✓ Account Type: {account.type}")
    
    # Check if trial account
    if account.type == 'Trial':
        print("\n⚠️  WARNING: This is a TRIAL account")
        print("   Trial accounts can only send SMS to verified phone numbers")
        print("   You need to verify your phone number in Twilio console first")
        print("   https://console.twilio.com/us1/develop/phone-numbers/manage/verified")
    
    # Prompt for test
    print("\n" + "=" * 60)
    test = input("Do you want to send a test SMS? (yes/no): ").lower()
    
    if test == 'yes':
        phone = input("Enter phone number (with country code, e.g., +9779812345678): ")
        
        print(f"\nSending test SMS to {phone}...")
        
        message = client.messages.create(
            body="Test OTP: 123456 - This is a test message from your Django app",
            from_=twilio_phone,
            to=phone
        )
        
        print(f"\n✓ SMS sent successfully!")
        print(f"  Message SID: {message.sid}")
        print(f"  Status: {message.status}")
        print(f"  To: {message.to}")
        print(f"  From: {message.from_}")
        
        if message.status == 'queued' or message.status == 'sent':
            print("\n✓ Check your phone for the SMS!")
        else:
            print(f"\n⚠️  Message status: {message.status}")
    
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    print("\nCommon issues:")
    print("1. Invalid Twilio credentials")
    print("2. Trial account trying to send to unverified number")
    print("3. Insufficient Twilio balance")
    print("4. Invalid phone number format")

print("\n" + "=" * 60)
