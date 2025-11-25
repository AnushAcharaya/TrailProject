import os
from twilio.rest import Client
from decouple import config

def test_twilio():
    """Test Twilio SMS connection"""
    try:
        # Load credentials from .env
        account_sid = config('TWILIO_ACCOUNT_SID')
        auth_token = config('TWILIO_AUTH_TOKEN')
        twilio_number = config('TWILIO_PHONE_NUMBER')
        
        print("📱 Testing Twilio connection...")
        print(f"   Account SID: {account_sid[:10]}...")
        print(f"   Phone Number: {twilio_number}")
        
        # Create Twilio client
        client = Client(account_sid, auth_token)
        
        # Verify credentials by fetching account info
        account = client.api.accounts(account_sid).fetch()
        
        print(f"✅ Twilio connection successful!")
        print(f"   Account Status: {account.status}")
        print(f"   Account Type: {account.type}")
        
        print("\n💡 To send test SMS, uncomment the code below and add your phone number")
        
        # Uncomment to send test SMS:
        # test_phone = "+977XXXXXXXXXX"  # Your Nepal phone number
        # message = client.messages.create(
        #     body="Test SMS from your Django app!",
        #     from_=twilio_number,
        #     to=test_phone
        # )
        # print(f"✅ Test SMS sent! SID: {message.sid}")
        
        return True
        
    except Exception as e:
        print(f"❌ Twilio connection failed!")
        print(f"   Error: {e}")
        print("\n💡 Solutions:")
        print("   1. Check your .env file has correct credentials")
        print("   2. Verify Account SID and Auth Token from Twilio Console")
        print("   3. Make sure phone number includes country code (+977 for Nepal)")
        return False

if __name__ == "__main__":
    test_twilio()
