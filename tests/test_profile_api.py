import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

print("=" * 60)
print("PROFILE API TEST")
print("=" * 60)

# Get farmer user
farmer = User.objects.filter(username='papu').first()
if farmer:
    # Generate token
    refresh = RefreshToken.for_user(farmer)
    access_token = str(refresh.access_token)
    
    print(f"\nFarmer: {farmer.username}")
    print(f"Token: {access_token[:50]}...")
    
    # Test profile API
    url = 'http://localhost:8000/api/v1/profile/'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"\nAPI Response Status: {response.status_code}")
        print(f"API Response: {response.json()}")
    except Exception as e:
        print(f"\nError: {e}")
else:
    print("\nFarmer 'papu' not found!")
