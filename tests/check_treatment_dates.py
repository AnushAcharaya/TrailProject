"""
Check treatment dates to understand why medicine tracking isn't showing them
"""
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment

print("=" * 80)
print("TREATMENT DATES CHECK")
print("=" * 80)

treatments = Treatment.objects.all().order_by('id')
today = datetime.now().date()

print(f"\nToday's date: {today}")
print(f"Total treatments: {treatments.count()}")

for treatment in treatments:
    medicine_count = treatment.medicines.count()
    
    print(f"\n{'='*80}")
    print(f"Treatment ID {treatment.id}: {treatment.treatment_name}")
    print(f"  Status: {treatment.status}")
    print(f"  Treatment Date: {treatment.treatment_date}")
    print(f"  Medicines: {medicine_count}")
    
    if medicine_count > 0:
        first_med = treatment.medicines.first()
        duration = first_med.duration
        end_date = treatment.treatment_date + timedelta(days=duration)
        
        print(f"  Duration: {duration} days")
        print(f"  End Date: {end_date}")
        print(f"  Days since start: {(today - treatment.treatment_date).days}")
        print(f"  Days until end: {(end_date - today).days}")
        
        # Check if it passes the tracking filter
        is_in_progress = treatment.status == "In Progress"
        is_in_date_range = treatment.treatment_date <= today <= end_date
        
        print(f"\n  Tracking Filter Check:")
        print(f"    - Status is 'In Progress': {is_in_progress}")
        print(f"    - Today >= treatment_date: {today >= treatment.treatment_date}")
        print(f"    - Today <= end_date: {today <= end_date}")
        print(f"    - In date range: {is_in_date_range}")
        print(f"    - Has medicines: {medicine_count > 0}")
        
        if is_in_progress and is_in_date_range and medicine_count > 0:
            print(f"  ✅ WILL SHOW in Medicine Tracking")
        else:
            print(f"  ❌ WILL NOT SHOW in Medicine Tracking")
            if not is_in_progress:
                print(f"     Reason: Status is '{treatment.status}', not 'In Progress'")
            if not is_in_date_range:
                if today < treatment.treatment_date:
                    print(f"     Reason: Treatment hasn't started yet")
                else:
                    print(f"     Reason: Treatment ended {(today - end_date).days} days ago")
    else:
        print(f"  ❌ No medicines - won't show in tracking")

print("\n" + "=" * 80)
print("SOLUTION:")
print("=" * 80)
print("""
To make treatments show in Medicine Tracking, they need:
1. Status = 'In Progress'
2. treatment_date <= today <= (treatment_date + duration)
3. At least one medicine

Your old treatments have old treatment_date values, so they're outside
the active date range. You need to update the treatment_date to today
or a recent date.
""")
print("=" * 80)
