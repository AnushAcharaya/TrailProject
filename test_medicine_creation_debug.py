import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment, Medicine
from medical.serializers import MedicineSerializer
import json

# Get the treatment
treatment = Treatment.objects.get(id=15)
print(f"Treatment: {treatment.treatment_name}")
print(f"Current medicines count: {treatment.medicines.count()}")

# Test data from frontend
medicine_data = {
    "name": "parasitamol",
    "dosage": "1",
    "frequency": 2,
    "duration": 3,
    "schedule_type": "exact",
    "start_time": "08:00",
    "interval_hours": 5,
    "exact_times": ["08:00", "13:00", "18:00"]
}

print(f"\nTest data: {medicine_data}")
print(f"Data type: {type(medicine_data)}")

# Try to create medicine using serializer
print("\n--- Testing MedicineSerializer ---")
serializer = MedicineSerializer(data=medicine_data)
print(f"Serializer created")
print(f"Is valid: {serializer.is_valid()}")

if not serializer.is_valid():
    print(f"Validation errors: {serializer.errors}")
else:
    print(f"Validated data: {serializer.validated_data}")
    try:
        medicine = serializer.save(treatment=treatment)
        print(f"✓ Medicine saved: ID={medicine.id}, Name={medicine.name}")
        print(f"✓ Treatment medicines count: {treatment.medicines.count()}")
    except Exception as e:
        print(f"✗ Error saving: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
