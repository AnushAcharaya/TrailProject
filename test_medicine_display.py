#!/usr/bin/env python
"""
Test script to verify medicines are being saved and returned correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment, Medicine
from medical.serializers import TreatmentSerializer

print("=" * 60)
print("MEDICINE DISPLAY TEST")
print("=" * 60)

# Get all treatments
treatments = Treatment.objects.all().prefetch_related('medicines')
print(f"\nTotal treatments: {treatments.count()}")

if treatments.count() == 0:
    print("\n⚠️  No treatments found in database!")
    print("Please create a treatment through the frontend first.")
else:
    for treatment in treatments[:3]:  # Show first 3
        print(f"\n{'=' * 60}")
        print(f"Treatment: {treatment.treatment_name}")
        print(f"Livestock: {treatment.livestock.tag_id}")
        print(f"Status: {treatment.status}")
        print(f"Medicines count: {treatment.medicines.count()}")
        
        if treatment.medicines.count() > 0:
            print("\nMedicines:")
            for med in treatment.medicines.all():
                print(f"  - {med.name}")
                print(f"    Dosage: {med.dosage}")
                print(f"    Frequency: {med.frequency}x/day")
                print(f"    Duration: {med.duration} days")
                print(f"    Schedule: {med.schedule_type}")
        else:
            print("\n⚠️  No medicines found for this treatment!")
        
        # Test serializer output
        print("\n--- Serializer Output ---")
        serializer = TreatmentSerializer(treatment)
        data = serializer.data
        print(f"Medicines in serialized data: {data.get('medicines', [])}")
        
        if data.get('medicines'):
            print("\nMedicine names from serializer:")
            for med in data['medicines']:
                print(f"  - {med.get('name', 'N/A')}")
        else:
            print("\n⚠️  Medicines field is empty in serialized data!")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
