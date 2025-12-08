"""
Script to check and update user phone numbers to correct format
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import CustomUser

print("=" * 60)
print("CHECKING USER PHONE NUMBERS")
print("=" * 60)

users = CustomUser.objects.all()

if not users.exists():
    print("\n❌ No users found in database!")
    print("\nCreate a user first:")
    print("1. Register via: http://localhost:5173/create-account")
    print("2. Or create admin: python manage.py createsuperuser")
else:
    print(f"\n✓ Found {users.count()} user(s):\n")
    
    for user in users:
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Phone: {user.phone}")
        print(f"Role: {user.role}")
        print(f"Status: {user.status}")
        
        # Check phone format
        if not user.phone.startswith('+'):
            print(f"⚠️  WARNING: Phone number doesn't have country code!")
            print(f"   Current: {user.phone}")
            print(f"   Should be: +977{user.phone} (for Nepal)")
            
            fix = input(f"\n   Fix this phone number? (yes/no): ").lower()
            if fix == 'yes':
                new_phone = input(f"   Enter correct phone (e.g., +9779849888438): ")
                user.phone = new_phone
                user.save()
                print(f"   ✓ Updated to: {user.phone}")
        else:
            print(f"✓ Phone format looks good!")
        
        print("-" * 60)

print("\n" + "=" * 60)
print("IMPORTANT: For Twilio TRIAL account:")
print("- You can only send SMS to VERIFIED phone numbers")
print("- Verify your phone at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified")
print("=" * 60)
