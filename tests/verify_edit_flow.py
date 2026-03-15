import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment
from medical.serializers import TreatmentSerializer

print("=" * 80)
print("VERIFY EDIT FLOW - Treatment ID 5")
print("=" * 80)

# Get treatment 5 (the one with medicines)
treatment = Treatment.objects.get(id=5)

print(f"\nTreatment: {treatment.treatment_name}")
print(f"Medicines in DB: {treatment.medicines.count()}")

# Serialize it (this is what the API returns)
serializer = TreatmentSerializer(treatment)
data = serializer.data

print("\n" + "=" * 80)
print("API RESPONSE (what frontend receives):")
print("=" * 80)
print(json.dumps(data, indent=2, default=str))

print("\n" + "=" * 80)
print("MEDICINES IN RESPONSE:")
print("=" * 80)

if data['medicines']:
    for i, med in enumerate(data['medicines'], 1):
        print(f"\nMedicine {i}:")
        print(f"  name: {med['name']}")
        print(f"  dosage: {med['dosage']}")
        print(f"  frequency: {med['frequency']}")
        print(f"  duration: {med['duration']}")
        print(f"  schedule_type: {med['schedule_type']}")
        print(f"  start_time: {med['start_time']}")
        print(f"  interval_hours: {med['interval_hours']}")
        print(f"  exact_times: {med['exact_times']}")
    
    print("\n✅ SUCCESS! Medicine data IS in the API response!")
    print("✅ This data WILL show in the edit form!")
else:
    print("\n❌ NO MEDICINES in API response")

print("\n" + "=" * 80)
