import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from appointment.serializers import AppointmentSerializer
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

User = get_user_model()

# Get the farmer and vet
farmer = User.objects.get(username='papu')
vet = User.objects.get(username='acharyaanush52@gmail.com')

print("=" * 60)
print("TESTING APPOINTMENT CREATION")
print("=" * 60)

# Test data that would be sent from frontend
test_data = {
    'veterinarian_id': vet.username,  # Using username as per serializer
    'animal_type': 'sheep',
    'reason': 'serious',
    'preferred_date': '2026-03-14',
    'preferred_time': '13:00',  # 24-hour format
}

print("\nTest Data:")
print(json.dumps(test_data, indent=2))

# Create a mock request
factory = APIRequestFactory()
request = factory.post('/api/v1/appointments/', test_data, format='json')
request.user = farmer

# Create serializer with context
serializer = AppointmentSerializer(data=test_data, context={'request': Request(request)})

print("\n" + "=" * 60)
print("VALIDATION RESULT")
print("=" * 60)

if serializer.is_valid():
    print("\n✓ Data is VALID")
    print("\nValidated Data:")
    print(json.dumps(serializer.validated_data, indent=2, default=str))
    
    # Try to save
    try:
        appointment = serializer.save()
        print(f"\n✓ Appointment created successfully!")
        print(f"  ID: {appointment.id}")
        print(f"  Farmer: {appointment.farmer.username}")
        print(f"  Vet: {appointment.veterinarian.username}")
        print(f"  Animal: {appointment.animal_type}")
        print(f"  Date: {appointment.preferred_date}")
        print(f"  Time: {appointment.preferred_time}")
        print(f"  Status: {appointment.status}")
    except Exception as e:
        print(f"\n✗ Error saving appointment: {e}")
else:
    print("\n✗ Data is INVALID")
    print("\nValidation Errors:")
    print(json.dumps(serializer.errors, indent=2))
    
    # Show detailed error messages
    for field, errors in serializer.errors.items():
        print(f"\n  Field '{field}':")
        for error in errors:
            print(f"    - {error}")
