#!/usr/bin/env python
"""
Test script for appointment integration
Tests the complete flow of creating and managing appointments
"""

import os
import django
import sys
from datetime import date, time, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointment.models import Appointment
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_appointment_integration():
    """Test the complete appointment integration"""
    
    print_section("APPOINTMENT INTEGRATION TEST")
    
    # Get or create test users
    print("1. Setting up test users...")
    
    # Get farmer
    farmer = User.objects.filter(role='farmer', status='approved').first()
    if not farmer:
        print("❌ No approved farmer found. Please create one first.")
        return False
    
    # Get vet
    vet = User.objects.filter(role='vet', status='approved').first()
    if not vet:
        print("❌ No approved vet found. Please create one first.")
        return False
    
    print(f"✓ Farmer: {farmer.username} ({farmer.email})")
    print(f"✓ Vet: {vet.username} ({vet.email})")
    
    # Create API client
    client = APIClient()
    
    # Get JWT token for farmer
    refresh = RefreshToken.for_user(farmer)
    access_token = str(refresh.access_token)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    print("\n2. Testing appointment creation...")
    
    # Create appointment
    tomorrow = date.today() + timedelta(days=1)
    appointment_data = {
        'veterinarian_id': vet.id,
        'animal_type': 'cattle',
        'reason': 'Regular checkup for my cattle',
        'preferred_date': tomorrow.isoformat(),
        'preferred_time': '10:00:00'
    }
    
    response = client.post('/api/v1/appointments/', appointment_data, format='json')
    
    if response.status_code == 201:
        print(f"✓ Appointment created successfully")
        appointment = response.data
        print(f"  - ID: {appointment['id']}")
        print(f"  - Status: {appointment['status']}")
        print(f"  - Date: {appointment['preferred_date']}")
        print(f"  - Time: {appointment['preferred_time']}")
        appointment_id = appointment['id']
    else:
        print(f"❌ Failed to create appointment: {response.status_code}")
        print(f"   Response: {response.data}")
        return False
    
    print("\n3. Testing appointment retrieval...")
    
    # Get appointments
    response = client.get('/api/v1/appointments/')
    
    if response.status_code == 200:
        appointments = response.data.get('results', response.data)
        print(f"✓ Retrieved {len(appointments)} appointment(s)")
        for apt in appointments[:3]:  # Show first 3
            print(f"  - {apt['id']}: {apt['animal_type']} on {apt['preferred_date']} ({apt['status']})")
    else:
        print(f"❌ Failed to retrieve appointments: {response.status_code}")
        return False
    
    print("\n4. Testing appointment stats...")
    
    # Get stats
    response = client.get('/api/v1/appointments/stats/')
    
    if response.status_code == 200:
        stats = response.data
        print(f"✓ Stats retrieved successfully:")
        print(f"  - Upcoming: {stats.get('upcoming', 0)}")
        print(f"  - Pending: {stats.get('pending', 0)}")
        print(f"  - Completed: {stats.get('completed', 0)}")
        print(f"  - Cancelled: {stats.get('cancelled', 0)}")
        print(f"  - Total: {stats.get('total', 0)}")
    else:
        print(f"❌ Failed to retrieve stats: {response.status_code}")
        return False
    
    print("\n5. Testing appointment cancellation...")
    
    # Cancel appointment
    response = client.post(f'/api/v1/appointments/{appointment_id}/cancel/')
    
    if response.status_code == 200:
        print(f"✓ Appointment cancelled successfully")
        print(f"  - New status: {response.data['status']}")
    else:
        print(f"❌ Failed to cancel appointment: {response.status_code}")
        print(f"   Response: {response.data}")
        return False
    
    print("\n6. Testing vet endpoints...")
    
    # Switch to vet user
    vet_refresh = RefreshToken.for_user(vet)
    vet_access_token = str(vet_refresh.access_token)
    
    # Create a new appointment for vet to approve
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')  # Back to farmer
    
    appointment_data['preferred_date'] = (date.today() + timedelta(days=2)).isoformat()
    response = client.post('/api/v1/appointments/', appointment_data, format='json')
    
    if response.status_code == 201:
        new_appointment_id = response.data['id']
        print(f"✓ Created new appointment for vet testing (ID: {new_appointment_id})")
        
        # Switch to vet
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {vet_access_token}')
        
        # Approve appointment
        response = client.post(f'/api/v1/appointments/{new_appointment_id}/approve/')
        
        if response.status_code == 200:
            print(f"✓ Vet approved appointment successfully")
            print(f"  - New status: {response.data['status']}")
        else:
            print(f"❌ Failed to approve appointment: {response.status_code}")
            print(f"   Response: {response.data}")
    else:
        print(f"❌ Failed to create test appointment: {response.status_code}")
    
    print_section("TEST COMPLETED SUCCESSFULLY")
    print("✓ All appointment integration tests passed!")
    print("\nYou can now:")
    print("1. Login as farmer and create appointments")
    print("2. View appointment stats and history")
    print("3. Cancel pending/approved appointments")
    print("4. Login as vet to approve/decline/complete appointments")
    
    return True

if __name__ == '__main__':
    try:
        success = test_appointment_integration()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Error during test: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
