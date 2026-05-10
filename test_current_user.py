"""
Test script to check which user is associated with a token
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("CURRENT USER TOKEN TEST")
print("=" * 60)

# Get token from command line argument
if len(sys.argv) < 2:
    print("\n❌ ERROR: No token provided")
    print("\nUsage: python test_current_user.py <your_token>")
    print("\nTo get your token:")
    print("1. Open browser DevTools (F12)")
    print("2. Go to Application/Storage tab")
    print("3. Check sessionStorage or localStorage for 'token'")
    print("4. Copy the token value")
    sys.exit(1)

token_string = sys.argv[1]

try:
    # Decode the token
    token = AccessToken(token_string)
    user_id = token['user_id']
    
    # Get the user
    user = User.objects.get(id=user_id)
    
    print(f"\n✅ TOKEN IS VALID")
    print(f"\n📋 USER INFORMATION:")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Role: {user.role}")
    print(f"   Full Name: {user.first_name} {user.last_name}")
    print(f"   Phone: {user.phone_number}")
    print(f"   Is Active: {user.is_active}")
    print(f"   Is Verified: {user.is_verified}")
    
    print(f"\n🔍 EXPECTED BEHAVIOR:")
    if user.role == 'farmer':
        print(f"   ✅ This user should see FARMER pages")
        print(f"   ✅ Profile should show: {user.first_name or user.username}")
    elif user.role == 'vet':
        print(f"   ✅ This user should see VET pages")
        print(f"   ✅ Profile should show: {user.first_name or user.username}")
    else:
        print(f"   ✅ This user should see ADMIN pages")
    
    print("\n" + "=" * 60)
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print("\nPossible reasons:")
    print("1. Token is expired")
    print("2. Token is invalid")
    print("3. User no longer exists")
    print("\nPlease log in again to get a fresh token.")
    print("=" * 60)
