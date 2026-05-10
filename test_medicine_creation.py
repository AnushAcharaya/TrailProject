#!/usr/bin/env python
"""Test script to verify medicine creation in medical app"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment, Medicine
from livestockcrud.models import Livestock
from django.contrib.auth import get_user_model

User = get_user_model()

# Get first treatment
treatment = Treatment.objects.first()
if treatment:
    print(f"\n{'='*60}")
    print(f"Treatment ID: {treatment.id}")
    print(f"Treatment Name: {treatment.treatment_name}")
    print(f"Livestock: {treatment.livestock.tag_id}")
    print(f"User: {treatment.user.username}")
    print(f"Medicines count: {treatment.medicines.count()}")
    print(f"{'='*60}\n")
    
    if treatment.medicines.exists():
        print("Medicines found:")
        for med in treatment.medicines.all():
            print(f"  - {med.name}: {med.dosage} ({med.frequency}x/day for {med.duration} days)")
    else:
        print("⚠️ NO MEDICINES FOUND!")
        print("\nLet's check if there are any Medicine objects at all:")
        all_medicines = Medicine.objects.all()
        print(f"Total Medicine objects in database: {all_medicines.count()}")
        
        if all_medicines.exists():
            print("\nAll medicines:")
            for med in all_medicines:
                print(f"  - {med.name} (Treatment: {med.treatment.treatment_name})")
else:
    print("No treatments found in database")
