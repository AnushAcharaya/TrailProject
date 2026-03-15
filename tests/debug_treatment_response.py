#!/usr/bin/env python
"""
Debug script to check what the API actually returns
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment
from medical.serializers import TreatmentSerializer
from django.test import RequestFactory

# Get the most recent treatment
treatment = Treatment.objects.select_related('livestock', 'user').prefetch_related('medicines').first()

if not treatment:
    print("❌ No treatments found. Please create one first.")
    exit()

print("=" * 60)
print("TREATMENT DATA IN DATABASE")
print("=" * 60)
print(f"ID: {treatment.id}")
print(f"Treatment Name: {treatment.treatment_name}")
print(f"Livestock Tag: {treatment.livestock.tag_id}")
print(f"Diagnosis: {treatment.diagnosis}")
print(f"Vet Name: {treatment.vet_name}")
print(f"Treatment Date: {treatment.treatment_date}")
print(f"Status: {treatment.status}")
print(f"\nMedicines Count: {treatment.medicines.count()}")

for i, med in enumerate(treatment.medicines.all(), 1):
    print(f"\nMedicine {i}:")
    print(f"  - Name: {med.name}")
    print(f"  - Dosage: {med.dosage}")
    print(f"  - Frequency: {med.frequency}")
    print(f"  - Duration: {med.duration}")
    print(f"  - Schedule Type: {med.schedule_type}")
    print(f"  - Start Time: {med.start_time}")
    print(f"  - Interval Hours: {med.interval_hours}")
    print(f"  - Exact Times: {med.exact_times}")

print("\n" + "=" * 60)
print("SERIALIZER OUTPUT (What API Returns)")
print("=" * 60)

# Create a fake request
factory = RequestFactory()
request = factory.get('/')
request.user = treatment.user

# Serialize
serializer = TreatmentSerializer(treatment, context={'request': request})
data = serializer.data

import json
print(json.dumps(data, indent=2, default=str))

print("\n" + "=" * 60)
print("MEDICINE FIELD CHECK")
print("=" * 60)
if 'medicines' in data:
    print(f"✅ medicines field exists")
    print(f"✅ medicines count: {len(data['medicines'])}")
    if data['medicines']:
        print(f"✅ First medicine name: {data['medicines'][0].get('name')}")
        print(f"\nFull medicine data:")
        print(json.dumps(data['medicines'], indent=2))
else:
    print("❌ medicines field missing!")
