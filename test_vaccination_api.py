#!/usr/bin/env python
"""
Test script to verify vaccination API endpoints
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from livestockcrud.models import Livestock, Species, Breed
from vaccination.models import Vaccination
from datetime import date, timedelta

User = get_user_model()

def test_vaccination_system():
    print("=" * 60)
    print("VACCINATION SYSTEM TEST")
    print("=" * 60)
    
    # Check if vaccination app is properly configured
    print("\n1. Checking Vaccination Model...")
    vaccination_count = Vaccination.objects.count()
    print(f"   Total vaccinations in database: {vaccination_count}")
    
    # List all vaccinations
    if vaccination_count > 0:
        print("\n2. Vaccination Records:")
        for vacc in Vaccination.objects.all()[:5]:  # Show first 5
            print(f"   - ID: {vacc.id}")
            print(f"     Livestock: {vacc.livestock.tag_id}")
            print(f"     Vaccine: {vacc.vaccine_name}")
            print(f"     Type: {vacc.vaccine_type}")
            print(f"     Date Given: {vacc.date_given}")
            print(f"     Next Due: {vacc.next_due_date}")
            print(f"     Status: {vacc.get_status()}")
            print(f"     Days Until Due: {vacc.days_until_due()}")
            print(f"     User: {vacc.user.username}")
            print()
    
    # Check livestock availability
    print("\n3. Available Livestock:")
    livestock_count = Livestock.objects.count()
    print(f"   Total livestock: {livestock_count}")
    
    if livestock_count > 0:
        for animal in Livestock.objects.all()[:3]:
            print(f"   - {animal.tag_id} ({animal.species}) - Owner: {animal.user.username}")
    
    # Check users
    print("\n4. Users in System:")
    for user in User.objects.all():
        vacc_count = Vaccination.objects.filter(user=user).count()
        livestock_count = Livestock.objects.filter(user=user).count()
        print(f"   - {user.username} ({user.role})")
        print(f"     Livestock: {livestock_count}, Vaccinations: {vacc_count}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_vaccination_system()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
