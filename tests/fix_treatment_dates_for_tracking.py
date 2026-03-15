"""
Update treatment dates so they show in Medicine Tracking tab
"""
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment

print("=" * 80)
print("FIXING TREATMENT DATES FOR MEDICINE TRACKING")
print("=" * 80)

today = datetime.now().date()
print(f"\nToday's date: {today}")

# Get treatments that need fixing
treatments_to_fix = Treatment.objects.filter(status='In Progress')

print(f"\nFound {treatments_to_fix.count()} 'In Progress' treatments")

for treatment in treatments_to_fix:
    medicine_count = treatment.medicines.count()
    
    if medicine_count == 0:
        print(f"\n❌ Skipping Treatment ID {treatment.id} ({treatment.treatment_name}) - No medicines")
        continue
    
    first_med = treatment.medicines.first()
    duration = first_med.duration
    old_date = treatment.treatment_date
    end_date = old_date + timedelta(days=duration)
    
    # Check if it's already in valid range
    if old_date <= today <= end_date:
        print(f"\n✅ Treatment ID {treatment.id} ({treatment.treatment_name}) - Already in valid range")
        print(f"   Start: {old_date}, End: {end_date}")
        continue
    
    # Update to start today
    treatment.treatment_date = today
    treatment.save()
    
    new_end_date = today + timedelta(days=duration)
    
    print(f"\n✅ Updated Treatment ID {treatment.id}: {treatment.treatment_name}")
    print(f"   Old date: {old_date}")
    print(f"   New date: {today}")
    print(f"   Duration: {duration} days")
    print(f"   New end date: {new_end_date}")
    print(f"   Will now show in Medicine Tracking!")

print("\n" + "=" * 80)
print("VERIFICATION:")
print("=" * 80)

# Verify all treatments
all_treatments = Treatment.objects.all().order_by('id')

for treatment in all_treatments:
    medicine_count = treatment.medicines.count()
    
    if medicine_count == 0:
        continue
    
    first_med = treatment.medicines.first()
    duration = first_med.duration
    end_date = treatment.treatment_date + timedelta(days=duration)
    
    is_in_progress = treatment.status == "In Progress"
    is_in_date_range = treatment.treatment_date <= today <= end_date
    
    status_icon = "✅" if (is_in_progress and is_in_date_range and medicine_count > 0) else "❌"
    
    print(f"\n{status_icon} Treatment ID {treatment.id}: {treatment.treatment_name}")
    print(f"   Status: {treatment.status}")
    print(f"   Date: {treatment.treatment_date} to {end_date}")
    print(f"   Medicines: {medicine_count}")
    
    if is_in_progress and is_in_date_range and medicine_count > 0:
        print(f"   ✅ WILL SHOW in Medicine Tracking")
    else:
        if not is_in_progress:
            print(f"   ❌ Status is '{treatment.status}'")
        elif not is_in_date_range:
            print(f"   ❌ Outside date range")

print("\n" + "=" * 80)
print("✅ DONE! Refresh your browser to see updated Medicine Tracking tab")
print("=" * 80)
