"""
Setup Twilio Verify Service for OTP
This is the ONLY way to send SMS to Nepal with a trial account
"""
from twilio.rest import Client
from decouple import config

account_sid = config('TWILIO_ACCOUNT_SID')
auth_token = config('TWILIO_AUTH_TOKEN')

client = Client(account_sid, auth_token)

print("=" * 60)
print("SETTING UP TWILIO VERIFY SERVICE")
print("=" * 60)

try:
    # Create a Verify Service
    service = client.verify.v2.services.create(
        friendly_name='Livestock Management OTP'
    )
    
    print(f"✓ Verify Service Created!")
    print(f"Service SID: {service.sid}")
    print(f"Friendly Name: {service.friendly_name}")
    print()
    print("=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    print(f"1. Add this to your .env file:")
    print(f"   TWILIO_VERIFY_SERVICE_SID={service.sid}")
    print()
    print("2. The code has been updated to use Verify API")
    print("3. Restart Celery worker")
    print("4. Try registering - SMS will be sent to Nepal!")
    print()
    print("Twilio Verify benefits:")
    print("✓ Works with trial accounts")
    print("✓ Sends to international numbers (including Nepal)")
    print("✓ Automatic retry and delivery optimization")
    print("✓ Built-in rate limiting and fraud detection")
    
except Exception as e:
    print(f"✗ Error creating Verify service: {e}")
    print()
    print("Checking existing Verify services...")
    
    services = client.verify.v2.services.list(limit=10)
    
    if services:
        print(f"\nFound {len(services)} existing Verify service(s):")
        for svc in services:
            print(f"  - {svc.friendly_name}: {svc.sid}")
        
        print()
        print("You can use an existing service. Add to .env:")
        print(f"TWILIO_VERIFY_SERVICE_SID={services[0].sid}")
    else:
        print("No existing services found.")
        print("Error details:", str(e))
