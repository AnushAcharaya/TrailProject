#!/usr/bin/env python
"""
Quick script to check medicine tracking data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment, Medicine
from datetime import date

print("\n" + "="*60)
print("MEDICINE TRACKING DEBUG")
print("="*60)

treatments = Treatment.objects.all().prefetch_related('medicines')
print(f"\nTotal treatments: {treatments.count()}")

for t in treatments:
    print(f"\n--- Treatment: {t.treatment_name} ---")
    print(f"ID: {t.id}")
    print(f"Status: {t.status}")
    print(f"Treatment Date: {t.treatment_date}")
    print(f"Livestock: {t.livestock.tag_id if t.livestock else 'None'}")
    
    medicines = t.medicines.all()
    print(f"Medicines count: {medicines.count()}")
    
    if medicines.exists():
        for med in medicines:
            print(f"  - {med.name}")
            print(f"    Dosage: {med.dosage}")
            print(f"    Frequency: {med.frequency}")
            print(f"    Duration: {med.duration}")
            print(f"    Schedule Type: {med.schedule_type}")
    else:
        print("  ⚠️ NO MEDICINES FOUND!")
    
    # Check if it would show in medicine tracking
    if medicines.exists() and t.status == "In Progress":
        start_date = t.treatment_date
        duration = medicines.first().duration
        from datetime import timedelta
        end_date = start_date + timedelta(days=duration)
        today = date.today()
        
        print(f"\n  Medicine Tracking Check:")
        print(f"    Start: {start_date}")
        print(f"    End: {end_date}")
        print(f"    Today: {today}")
        print(f"    In range? {start_date <= today <= end_date}")
        print(f"    Would show in tracking? {start_date <= today <= end_date and t.status == 'In Progress'}")

print("\n" + "="*60)
