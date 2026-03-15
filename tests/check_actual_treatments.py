import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment, Medicine

print("=" * 60)
print("CHECKING ACTUAL TREATMENTS IN DATABASE")
print("=" * 60)

treatments = Treatment.objects.all()
print(f"\nTotal treatments: {treatments.count()}")

for treatment in treatments:
    print(f"\n{'=' * 60}")
    print(f"Treatment ID: {treatment.id}")
    print(f"Name: {treatment.treatment_name}")
    print(f"Livestock: {treatment.livestock.tag_id}")
    print(f"User: {treatment.user.email}")
    print(f"Date: {treatment.treatment_date}")
    print(f"Status: {treatment.status}")
    
    medicines = treatment.medicines.all()
    print(f"\nMedicines count: {medicines.count()}")
    
    if medicines.count() > 0:
        for i, med in enumerate(medicines, 1):
            print(f"\n  Medicine {i}:")
            print(f"    Name: {med.name}")
            print(f"    Dosage: {med.dosage}")
            print(f"    Frequency: {med.frequency}")
            print(f"    Duration: {med.duration}")
            print(f"    Schedule Type: {med.schedule_type}")
            print(f"    Start Time: {med.start_time}")
            print(f"    Interval Hours: {med.interval_hours}")
            print(f"    Exact Times: {med.exact_times}")
    else:
        print("  ⚠️  NO MEDICINES FOUND!")

print("\n" + "=" * 60)
print("CHECKING ORPHANED MEDICINES (medicines without treatment)")
print("=" * 60)

all_medicines = Medicine.objects.all()
print(f"\nTotal medicines in database: {all_medicines.count()}")

orphaned = Medicine.objects.filter(treatment__isnull=True)
print(f"Orphaned medicines (no treatment): {orphaned.count()}")

if orphaned.count() > 0:
    for med in orphaned:
        print(f"  - {med.name} (ID: {med.id})")

print("\n" + "=" * 60)
