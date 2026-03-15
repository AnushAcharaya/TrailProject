import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from medical.models import Treatment, Medicine
from livestockcrud.models import Livestock
from medical.serializers import TreatmentSerializer
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

User = get_user_model()

print("=" * 60)
print("MEDICINE CREATE DEBUG TEST")
print("=" * 60)

# Get a user
user = User.objects.filter(role='farmer').first()
if not user:
    print("❌ No farmer user found!")
    exit()

print(f"\n✓ Using user: {user.email}")

# Get a livestock
livestock = Livestock.objects.filter(user=user).first()
if not livestock:
    print("❌ No livestock found for this user!")
    exit()

print(f"✓ Using livestock: {livestock.tag_id}")

# Simulate the data that would come from the frontend
test_data = {
    "livestock_tag": livestock.tag_id,
    "treatment_name": "Test Treatment with Medicines",
    "diagnosis": "Test diagnosis",
    "vet_name": "Dr. Test",
    "treatment_date": "2024-01-15",
    "status": "In Progress",
    "medicines": [
        {
            "name": "Test Medicine 1",
            "dosage": "5 mL",
            "frequency": 2,
            "duration": 7,
            "schedule_type": "interval",
            "start_time": "08:00:00",
            "interval_hours": 12,
            "exact_times": []
        },
        {
            "name": "Test Medicine 2",
            "dosage": "10 mg",
            "frequency": 3,
            "duration": 5,
            "schedule_type": "exact",
            "start_time": "08:00:00",
            "interval_hours": 8,
            "exact_times": ["08:00:00", "14:00:00", "20:00:00"]
        }
    ]
}

print("\n" + "=" * 60)
print("TEST DATA:")
print("=" * 60)
print(json.dumps(test_data, indent=2))

# Create a fake request
factory = APIRequestFactory()
request = factory.post('/api/treatments/', test_data, format='json')
request.user = user
request = Request(request)

print("\n" + "=" * 60)
print("CREATING TREATMENT...")
print("=" * 60)

try:
    serializer = TreatmentSerializer(data=test_data, context={'request': request})
    if serializer.is_valid():
        print("✓ Serializer validation passed")
        treatment = serializer.save()
        print(f"✓ Treatment created: {treatment.id}")
        
        # Check medicines
        medicines = treatment.medicines.all()
        print(f"\n✓ Medicines count: {medicines.count()}")
        
        for i, med in enumerate(medicines, 1):
            print(f"\nMedicine {i}:")
            print(f"  Name: {med.name}")
            print(f"  Dosage: {med.dosage}")
            print(f"  Frequency: {med.frequency}")
            print(f"  Duration: {med.duration}")
            print(f"  Schedule Type: {med.schedule_type}")
            print(f"  Start Time: {med.start_time}")
            print(f"  Interval Hours: {med.interval_hours}")
            print(f"  Exact Times: {med.exact_times}")
        
        # Now test retrieval
        print("\n" + "=" * 60)
        print("TESTING RETRIEVAL...")
        print("=" * 60)
        
        retrieved_treatment = Treatment.objects.get(id=treatment.id)
        serializer = TreatmentSerializer(retrieved_treatment)
        print("\nSerialized data:")
        print(json.dumps(serializer.data, indent=2, default=str))
        
    else:
        print("❌ Serializer validation failed:")
        print(serializer.errors)
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
