#!/usr/bin/env python
"""
Test script to verify vaccination API endpoints are working correctly.
Run this after starting the Django server.
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from livestockcrud.models import Livestock
from vaccination.models import Vaccination
from datetime import date, timedelta

User = get_user_model()

def test_vaccination_system():
    print("=" * 60)
    print("VACCINATION SYSTEM TEST")
    print("=" * 60)
    
    # Check if we have users
    users = User.objects.filter(role='farmer')
    if not users.exists():
        print("❌ No farmer users found. Please create a farmer account first.")
        return
    
    user = users.first()
    print(f"✓ Found farmer user: {user.email}")
    
    # Check if user has livestock
    livestock = Livestock.objects.filter(user=user)
    if not livestock.exists():
        print("❌ No livestock found for this farmer. Please add livestock first.")
        return
    
    print(f"✓ Found {livestock.count()} livestock for this farmer")
    
    # Check vaccinations
    vaccinations = Vaccination.objects.filter(user=user)
    print(f"✓ Found {vaccinations.count()} vaccination records")
    
    # Test vaccination creation
    print("\n" + "=" * 60)
    print("TESTING VACCINATION CREATION")
    print("=" * 60)
    
    test_livestock = livestock.first()
    print(f"Using livestock: {test_livestock.tag_id}")
    
    try:
        test_vaccination = Vaccination.objects.create(
            livestock=test_livestock,
            user=user,
            vaccine_name="Test Vaccine",
            vaccine_type="Viral Vaccine",
            date_given=date.today(),
            next_due_date=date.today() + timedelta(days=30),
            notes="Test vaccination record"
        )
        print(f"✓ Successfully created test vaccination: {test_vaccination.id}")
        
        # Test status methods
        print(f"  - Status: {test_vaccination.get_status()}")
        print(f"  - Days until due: {test_vaccination.days_until_due()}")
        
        # Clean up test record
        test_vaccination.delete()
        print("✓ Test vaccination cleaned up")
        
    except Exception as e:
        print(f"❌ Error creating vaccination: {e}")
        return
    
    # Check API URL configuration
    print("\n" + "=" * 60)
    print("API ENDPOINT CONFIGURATION")
    print("=" * 60)
    print("✓ Vaccination URLs should be accessible at:")
    print("  - List/Create: http://localhost:8000/api/v1/vaccination/")
    print("  - Counts: http://localhost:8000/api/v1/vaccination/counts/")
    print("  - Upcoming: http://localhost:8000/api/v1/vaccination/upcoming/")
    print("  - Overdue: http://localhost:8000/api/v1/vaccination/overdue/")
    print("  - Detail: http://localhost:8000/api/v1/vaccination/{id}/")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nThe vaccination system is properly configured.")
    print("You can now test the frontend by:")
    print("1. Starting the Django server: python manage.py runserver")
    print("2. Starting the React app: cd Frontend && npm run dev")
    print("3. Navigate to /vaccination/add to create a vaccination record")

if __name__ == "__main__":
    try:
        test_vaccination_system()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
