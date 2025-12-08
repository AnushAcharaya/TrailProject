"""
Enable Nepal (NP) for Twilio Verify Service
"""
from twilio.rest import Client
from decouple import config

account_sid = config('TWILIO_ACCOUNT_SID')
auth_token = config('TWILIO_AUTH_TOKEN')
verify_service_sid = config('TWILIO_VERIFY_SERVICE_SID')

client = Client(account_sid, auth_token)

print("=" * 60)
print("ENABLING NEPAL FOR TWILIO VERIFY")
print("=" * 60)

try:
    # Get current geo permissions
    print("\nChecking current geo-permissions...")
    
    # Try to get Nepal's current status
    try:
        nepal = client.verify \
            .v2 \
            .services(verify_service_sid) \
            .messaging_configurations \
            .countries('NP') \
            .fetch()
        
        print(f"Nepal Status: {nepal.enabled}")
        
        if not nepal.enabled:
            print("\nEnabling Nepal...")
            # Enable Nepal
            nepal = client.verify \
                .v2 \
                .services(verify_service_sid) \
                .messaging_configurations \
                .countries('NP') \
                .update(enabled=True)
            
            print(f"✓ Nepal enabled for Verify service!")
        else:
            print("✓ Nepal is already enabled!")
            
    except Exception as e:
        print(f"Could not fetch Nepal status: {e}")
        print("\nTrying to enable Nepal directly...")
        
        # Try to enable it
        nepal = client.verify \
            .v2 \
            .services(verify_service_sid) \
            .messaging_configurations \
            .countries('NP') \
            .update(enabled=True)
        
        print(f"✓ Nepal enabled for Verify service!")
    
    print()
    print("=" * 60)
    print("SUCCESS!")
    print("=" * 60)
    print("Nepal is now enabled for SMS verification.")
    print("Restart Celery and try registering again!")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    print()
    print("=" * 60)
    print("MANUAL STEPS REQUIRED")
    print("=" * 60)
    print("You need to enable Nepal manually:")
    print()
    print("1. Go to: https://console.twilio.com/us1/develop/verify/services")
    print(f"2. Click on your service: Livestock Management OTP")
    print("3. Go to 'Geo-Permissions' tab")
    print("4. Find 'Nepal' in the list")
    print("5. Toggle it to 'Enabled'")
    print("6. Save changes")
    print()
    print("Then restart Celery and try again!")
