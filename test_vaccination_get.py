#!/usr/bin/env python
"""
Test script to verify vaccination GET endpoint works correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vaccination.models import Vaccination
from vaccination.serializers import VaccinationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("VACCINATION GET ENDPOINT TEST")
print("=" * 60)

# Find a farmer user
farmer = User.objects.filter(role='farmer').first()
if not farmer:
    print("❌ No farmer user found")
    exit(1)

print(f"✓ Testing with farmer: {farmer.email}")

# Get vaccinations for this farmer
vaccinations = Vaccination.objects.filter(user=farmer).select_related('livestock', 'livestock__species', 'livestock__breed')
print(f"✓ Found {vaccinations.count()} vaccination(s)")

if vaccinations.count() == 0:
    print("\n⚠️  No vaccinations found. Create one first using the frontend.")
    exit(0)

# Test serialization
print("\n" + "=" * 60)
print("TESTING SERIALIZATION")
print("=" * 60)

for vaccination in vaccinations:
    print(f"\nVaccination ID: {vaccination.id}")
    print(f"Vaccine: {vaccination.vaccine_name}")
    print(f"Livestock: {vaccination.livestock.tag_id}")
    print(f"Species: {vaccination.livestock.species.name if vaccination.livestock.species else 'N/A'}")
    print(f"Breed: {vaccination.livestock.breed.name if vaccination.livestock.breed else 'N/A'}")
    
    # Serialize
    try:
        serializer = VaccinationSerializer(vaccination)
        data = serializer.data
        print(f"✓ Serialization successful")
        print(f"  - livestock.tag_id: {data['livestock']['tag_id']}")
        print(f"  - livestock.species_name: {data['livestock']['species_name']}")
        print(f"  - livestock.breed_name: {data['livestock']['breed_name']}")
    except Exception as e:
        print(f"❌ Serialization failed: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 60)
print("✅ TEST COMPLETE")
print("=" * 60)
print("\nIf serialization works here but fails in the browser:")
print("1. Restart Django server: python manage.py runserver")
print("2. Clear browser cache and reload")
print("3. Check browser console for detailed error")
