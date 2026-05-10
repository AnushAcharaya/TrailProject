#!/usr/bin/env python
"""Test creating a treatment with medicines directly"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.serializers import TreatmentSerializer
from livestockcrud.models import Livestock
from django.contrib.auth import get_user_model

User = get_user_model()

# Get a livestock and user
livestock = Livestock.objects.first()
user = livestock.user if livestock else None

if not livestock or not user:
    print("No livestock or user found!")
    exit(1)

print(f"\n{'='*60}")
print(f"Testing treatment creation with medicines")
print(f"Livestock: {livestock.tag_id}")
print(f"User: {user.username}")
print(f"{'='*60}\n")

# Prepare test data (matching what frontend sends)
test_data = {
    'livestock_tag': livestock.tag_id,
    'treatment_name': 'Test Treatment with Medicines',
    'diagnosis': 'Test diagnosis',
    'vet_name': 'Test Vet',
    'treatment_date': '2026-04-13',
    'status': 'In Progress',
    'medicines': [
        {
            'name': 'Test Medicine A',
            'dosage': '10mg',
            'frequency': 2,
            'duration': 5,
            'schedule_type': 'interval',
            'start_time': '08:00:00',
            'interval_hours': 12,
            'exact_times': []
        },
        {
            'name': 'Test Medicine B',
            'dosage': '20ml',
            'frequency': 3,
            'duration': 7,
            'schedule_type': 'exact',
            'start_time': '08:00:00',
            'interval_hours': 8,
            'exact_times': ['08:00', '14:00', '20:00']
        }
    ]
}

print("Test data:")
print(json.dumps(test_data, indent=2))
print()

# Create treatment using serializer
from rest_framework.request import Request
from django.test import RequestFactory

factory = RequestFactory()
request = factory.post('/api/v1/medical/treatments/')
request.user = user

serializer = TreatmentSerializer(data=test_data, context={'request': request})

if serializer.is_valid():
    print("✓ Serializer is valid")
    treatment = serializer.save()
    print(f"✓ Treatment created: ID={treatment.id}, Name={treatment.treatment_name}")
    print(f"✓ Medicines count: {treatment.medicines.count()}")
    
    if treatment.medicines.exists():
        print("\nMedicines created:")
        for med in treatment.medicines.all():
            print(f"  - {med.name}: {med.dosage} ({med.frequency}x/day for {med.duration} days)")
    else:
        print("\n⚠️ NO MEDICINES CREATED!")
else:
    print("✗ Serializer validation failed:")
    print(serializer.errors)
