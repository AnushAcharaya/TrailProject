#!/usr/bin/env python
"""
Full test for medical treatment creation
This tests the complete flow including authentication
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import CustomUser
from livestockcrud.models import Livestock, Species, Breed
from medical.models import Treatment, Medicine
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

def test_treatment_creation():
    print("Testing Medical Treatment Creation")
    print("=" * 60)
    
    # Create test user
    print("\n1. Creating test user...")
    user = CustomUser.objects.filter(email='test@example.com').first()
    if not user:
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='farmer',
            is_verified=True
        )
        print(f"   ✓ Created user: {user.email}")
    else:
        print(f"   ✓ Using existing user: {user.email}")
    
    # Create test livestock
    print("\n2. Creating test livestock...")
    species, _ = Species.objects.get_or_create(name='Cow')
    breed, _ = Breed.objects.get_or_create(name='Holstein', species=species)
    
    livestock = Livestock.objects.filter(user=user).first()
    if not livestock:
        livestock = Livestock.objects.create(
            user=user,
            species=species,
            breed=breed,
            date_of_birth='2020-01-01',
            gender='Male'
        )
        print(f"   ✓ Created livestock: {livestock.tag_id}")
    else:
        print(f"   ✓ Using existing livestock: {livestock.tag_id}")
    
    # Generate JWT token
    print("\n3. Generating JWT token...")
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    print(f"   ✓ Token generated: {token[:20]}...")
    
    # Test API call
    print("\n4. Testing POST /api/v1/medical/treatments/")
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    treatment_data = {
        'livestock_tag': livestock.tag_id,
        'treatment_name': 'Test Treatment',
        'diagnosis': 'Test diagnosis',
        'vet_name': 'Dr. Test',
        'treatment_date': '2026-03-11',
        'status': 'In Progress',
        'medicines': [
            {
                'name': 'Test Medicine',
                'dosage': '5 mL',
                'frequency': 2,
                'duration': 3,
                'scheduleType': 'interval',
                'startTime': '08:00',
                'intervalHours': 8
            }
        ]
    }
    
    response = client.post(
        '/api/v1/medical/treatments/',
        data=treatment_data,
        format='json'
    )
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 201:
        print("   ✓ Treatment created successfully!")
        print(f"   Response: {response.data}")
    else:
        print(f"   ✗ Failed to create treatment")
        print(f"   Error: {response.data}")
    
    print("\n" + "=" * 60)
    print("Test complete!")
    
    # Cleanup
    if response.status_code == 201:
        treatment_id = response.data.get('id')
        if treatment_id:
            Treatment.objects.filter(id=treatment_id).delete()
            print("✓ Test data cleaned up")

if __name__ == "__main__":
    test_treatment_creation()
