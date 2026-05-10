#!/usr/bin/env python
"""
Test script for the Vet List API endpoint
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
from authentication.models import CustomUser
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.views import VetListView

# Add testserver to ALLOWED_HOSTS temporarily
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

def test_vet_list_api():
    print("=" * 60)
    print("Testing Vet List API Endpoint")
    print("=" * 60)
    
    # Get a farmer user for authentication
    try:
        farmer = CustomUser.objects.filter(role='farmer', status='approved').first()
        if not farmer:
            print("❌ No approved farmer found in database")
            return
        
        print(f"\n✓ Using farmer: {farmer.full_name} ({farmer.username})")
        
        # Generate JWT token
        refresh = RefreshToken.for_user(farmer)
        access_token = str(refresh.access_token)
        print(f"✓ Generated JWT token: {access_token[:30]}...")
        
        # Create API client
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Test 1: Get all vets (no search)
        print("\n" + "-" * 60)
        print("Test 1: Get all approved vets (no search)")
        print("-" * 60)
        response = client.get('/api/v1/auth/vets/')
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            data = response.json()
            if data.get('success'):
                vets = data.get('vets', [])
                print(f"✓ Found {len(vets)} vets")
                for vet in vets:
                    print(f"  - {vet['name']} (ID: {vet['id']})")
            else:
                print("❌ API returned success=false")
        else:
            print(f"❌ API returned error: {response.status_code}")
            print(f"Response content: {response.content}")
        
        # Test 2: Search for specific vet
        print("\n" + "-" * 60)
        print("Test 2: Search for 'Kamal'")
        print("-" * 60)
        response = client.get('/api/v1/auth/vets/?search=Kamal')
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            data = response.json()
            if data.get('success'):
                vets = data.get('vets', [])
                print(f"✓ Found {len(vets)} vets matching 'Kamal'")
                for vet in vets:
                    print(f"  - {vet['name']} (ID: {vet['id']})")
            else:
                print("❌ API returned success=false")
        else:
            print(f"❌ API returned error: {response.status_code}")
        
        # Test 3: Search for partial match
        print("\n" + "-" * 60)
        print("Test 3: Search for 'Bin' (partial match)")
        print("-" * 60)
        response = client.get('/api/v1/auth/vets/?search=Bin')
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            data = response.json()
            if data.get('success'):
                vets = data.get('vets', [])
                print(f"✓ Found {len(vets)} vets matching 'Bin'")
                for vet in vets:
                    print(f"  - {vet['name']} (ID: {vet['id']})")
            else:
                print("❌ API returned success=false")
        else:
            print(f"❌ API returned error: {response.status_code}")
        
        # Test 4: Search with no results
        print("\n" + "-" * 60)
        print("Test 4: Search for 'XYZ' (no results expected)")
        print("-" * 60)
        response = client.get('/api/v1/auth/vets/?search=XYZ')
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            data = response.json()
            if data.get('success'):
                vets = data.get('vets', [])
                print(f"✓ Found {len(vets)} vets matching 'XYZ' (expected 0)")
            else:
                print("❌ API returned success=false")
        else:
            print(f"❌ API returned error: {response.status_code}")
        
        print("\n" + "=" * 60)
        print("✓ All tests completed")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_vet_list_api()
