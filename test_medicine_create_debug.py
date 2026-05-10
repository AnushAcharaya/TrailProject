"""
Debug test to see why medicines aren't being saved
"""

import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.serializers import TreatmentSerializer
from livestockcrud.models import Livestock
from django.contrib.auth import get_user_model

User = get_user_model()

# Get a test user and livestock
user = User.objects.filter(role='farmer').first()
if not user:
    print("No farmer user found!")
    exit(1)

livestock = Livestock.objects.filter(user=user).first()
if not livestock:
    print("No livestock found for user!")
    exit(1)

print(f"Using user: {user.username}")
print(f"Using livestock: {livestock.tag_id}")

# Simulate the data that comes from the frontend
data = {
    'livestock_tag': livestock.tag_id,
    'treatment_name': 'Test Treatment',
    'diagnosis': 'Test diagnosis',
    'vet_name': 'Test Vet',
    'treatment_date': '2026-04-15',
    'status': 'In Progress',
    'medicines': [
        {
            'name': 'Paracetamol',
            'dosage': '500mg',
            'frequency': 2,
            'duration': 3,
            'schedule_type': 'interval',
            'start_time': '08:00',
            'interval_hours': 8,
            'exact_times': ['08:00', '16:00']
        }
    ]
}

print("\n" + "="*60)
print("TEST: Creating treatment with medicines")
print("="*60)
print(f"Input data: {json.dumps(data, indent=2)}")

# Create serializer with context
serializer = TreatmentSerializer(data=data, context={'request': type('obj', (object,), {'user': user})()})

print("\n" + "="*60)
print("Validating...")
print("="*60)

is_valid = serializer.is_valid()
print(f"Is valid: {is_valid}")

if not is_valid:
    print(f"Errors: {serializer.errors}")
    exit(1)

print(f"Validated data keys: {serializer.validated_data.keys()}")
print(f"'medicines' in validated_data: {'medicines' in serializer.validated_data}")

if 'medicines' in serializer.validated_data:
    print(f"Medicines value: {serializer.validated_data['medicines']}")
    print(f"Medicines length: {len(serializer.validated_data['medicines'])}")
else:
    print("⚠️ NO 'medicines' IN validated_data!")

print("\n" + "="*60)
print("Saving...")
print("="*60)

treatment = serializer.save()

print(f"Treatment created: ID={treatment.id}")
print(f"Medicines count in DB: {treatment.medicines.count()}")

if treatment.medicines.exists():
    for med in treatment.medicines.all():
        print(f"  - {med.name} ({med.dosage})")
    print("✓ SUCCESS: Medicines were saved!")
else:
    print("✗ FAILURE: No medicines in database!")

# Cleanup
treatment.delete()
print("\nTest treatment deleted.")
