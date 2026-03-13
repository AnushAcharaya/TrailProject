#!/usr/bin/env python
"""
Test script to verify medicines are being saved to database
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment, Medicine
from django.contrib.auth import get_user_model

User = get_user_model()

print("\n" + "="*60)
print("MEDICINE SAVE TEST")
print("="*60)

# Check existing treatments
treatments = Treatment.objects.all()
print(f"\nTotal treatments in database: {treatments.count()}")

for treatment in treatments:
    medicines_count = treatment.medicines.count()
    print(f"\nTreatment ID {treatment.id}: {treatment.treatment_name}")
    print(f"  Livestock: {treatment.livestock.tag_id}")
    print(f"  Medicines count: {medicines_count}")
    
    if medicines_count > 0:
        print(f"  Medicines:")
        for med in treatment.medicines.all():
            print(f"    - {med.name}")
            print(f"      Dosage: {med.dosage}")
            print(f"      Frequency: {med.frequency}x/day")
            print(f"      Duration: {med.duration} days")
            print(f"      Schedule: {med.schedule_type}")
            print(f"      Start time: {med.start_time}")
            if med.schedule_type == 'interval':
                print(f"      Interval: {med.interval_hours} hours")
            else:
                print(f"      Exact times: {med.exact_times}")
    else:
        print(f"  ⚠️ NO MEDICINES FOUND!")

print("\n" + "="*60)
print("Now create a new treatment via the form and check again")
print("="*60 + "\n")
