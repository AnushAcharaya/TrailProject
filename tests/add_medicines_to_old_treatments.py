"""
Add medicine data to old treatments so they show in edit form

This script adds sample medicine data to your existing treatments
so you can see the medicine section when editing them.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment, Medicine

print("=" * 80)
print("ADDING MEDICINES TO OLD TREATMENTS")
print("=" * 80)

# Get treatments without medicines
treatments_without_medicines = Treatment.objects.filter(medicines__isnull=True).distinct()

print(f"\nFound {treatments_without_medicines.count()} treatments without medicines")

for treatment in treatments_without_medicines:
    print(f"\n📋 Adding medicines to: {treatment.treatment_name} (ID: {treatment.id})")
    
    # Add appropriate medicines based on treatment name
    if 'snake bite' in treatment.treatment_name.lower():
        medicines = [
            {
                'name': 'Anti-venom Serum',
                'dosage': '10 mL',
                'frequency': 1,
                'duration': 1,
                'schedule_type': 'interval',
                'start_time': '08:00:00',
                'interval_hours': 24,
                'exact_times': []
            },
            {
                'name': 'Antibiotic',
                'dosage': '5 mL',
                'frequency': 2,
                'duration': 7,
                'schedule_type': 'interval',
                'start_time': '08:00:00',
                'interval_hours': 12,
                'exact_times': []
            }
        ]
    elif 'cold' in treatment.treatment_name.lower():
        medicines = [
            {
                'name': 'Vitamin C',
                'dosage': '500 mg',
                'frequency': 2,
                'duration': 5,
                'schedule_type': 'exact',
                'start_time': '08:00:00',
                'interval_hours': 12,
                'exact_times': ['08:00:00', '20:00:00']
            }
        ]
    elif 'hookworm' in treatment.treatment_name.lower():
        medicines = [
            {
                'name': 'Dewormer',
                'dosage': '10 mL',
                'frequency': 1,
                'duration': 3,
                'schedule_type': 'interval',
                'start_time': '08:00:00',
                'interval_hours': 24,
                'exact_times': []
            }
        ]
    else:
        # Generic medicine for other treatments
        medicines = [
            {
                'name': 'General Medicine',
                'dosage': '5 mL',
                'frequency': 2,
                'duration': 5,
                'schedule_type': 'interval',
                'start_time': '08:00:00',
                'interval_hours': 12,
                'exact_times': []
            }
        ]
    
    # Create medicines
    for med_data in medicines:
        medicine = Medicine.objects.create(
            treatment=treatment,
            **med_data
        )
        print(f"   ✓ Added: {medicine.name} ({medicine.dosage})")

print("\n" + "=" * 80)
print("VERIFICATION:")
print("=" * 80)

# Verify all treatments now have medicines
all_treatments = Treatment.objects.all().order_by('id')
for treatment in all_treatments:
    medicine_count = treatment.medicines.count()
    status = "✅" if medicine_count > 0 else "❌"
    print(f"\n{status} Treatment ID {treatment.id}: {treatment.treatment_name}")
    print(f"   Medicines: {medicine_count}")
    if medicine_count > 0:
        for med in treatment.medicines.all():
            print(f"      - {med.name} ({med.dosage})")

print("\n" + "=" * 80)
print("✅ DONE! Now all treatments have medicine data.")
print("✅ When you edit any treatment, medicines will show in the form!")
print("=" * 80)
