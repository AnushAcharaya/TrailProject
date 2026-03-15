import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from livestockcrud.models import Livestock
from medical.views import TreatmentViewSet
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

User = get_user_model()

print("=" * 60)
print("TEST: CREATE TREATMENT WITH MEDICINES")
print("=" * 60)

# Get a user
user = User.objects.filter(role='farmer').first()
if not user:
    print("❌ No farmer user found!")
    exit()

print(f"\n✓ Using user: {user.email}")

# Get a livestock owned by this user
livestock = Livestock.objects.filter(user=user).first()
if not livestock:
    print("❌ No livestock found for this user!")
    exit()

print(f"✓ Using livestock: {livestock.tag_id}")

# Prepare data as it would come from frontend (with JSON string for medicines)
medicines_data = [
    {
        "name": "Test Medicine A",
        "dosage": "10 mL",
        "frequency": 2,
        "duration": 5,
        "schedule_type": "interval",
        "start_time": "08:00:00",
        "interval_hours": 12,
        "exact_times": []
    },
    {
        "name": "Test Medicine B",
        "dosage": "5 mg",
        "frequency": 3,
        "duration": 7,
        "schedule_type": "exact",
        "start_time": "08:00:00",
        "interval_hours": 8,
        "exact_times": ["08:00:00", "14:00:00", "20:00:00"]
    }
]

post_data = {
    "livestock_tag": livestock.tag_id,
    "treatment_name": "Test Treatment with Real Medicines",
    "diagnosis": "Testing medicine creation",
    "vet_name": "Dr. Test",
    "treatment_date": "2024-03-15",
    "status": "In Progress",
    "medicines": json.dumps(medicines_data)  # Simulating FormData JSON string
}

print("\n" + "=" * 60)
print("POST DATA:")
print("=" * 60)
print(f"livestock_tag: {post_data['livestock_tag']}")
print(f"treatment_name: {post_data['treatment_name']}")
print(f"medicines (JSON string): {post_data['medicines']}")

# Create request with multipart format (like FormData)
factory = APIRequestFactory()
request = factory.post('/api/v1/medical/treatments/', post_data, format='multipart')
request.user = user

# Create viewset and call create
viewset = TreatmentViewSet()
viewset.request = Request(request)
viewset.format_kwarg = None

print("\n" + "=" * 60)
print("CREATING TREATMENT...")
print("=" * 60)

try:
    response = viewset.create(Request(request))
    print(f"\n✓ Response status: {response.status_code}")
    print(f"✓ Response data: {json.dumps(response.data, indent=2, default=str)}")
    
    # Verify in database
    from medical.models import Treatment
    treatment_id = response.data['id']
    treatment = Treatment.objects.get(id=treatment_id)
    
    print(f"\n" + "=" * 60)
    print("VERIFICATION:")
    print("=" * 60)
    print(f"Treatment ID: {treatment.id}")
    print(f"Treatment Name: {treatment.treatment_name}")
    print(f"Medicines count in DB: {treatment.medicines.count()}")
    
    for i, med in enumerate(treatment.medicines.all(), 1):
        print(f"\nMedicine {i}:")
        print(f"  Name: {med.name}")
        print(f"  Dosage: {med.dosage}")
        print(f"  Frequency: {med.frequency}")
        print(f"  Duration: {med.duration}")
        print(f"  Schedule Type: {med.schedule_type}")
        print(f"  Start Time: {med.start_time}")
        print(f"  Interval Hours: {med.interval_hours}")
        print(f"  Exact Times: {med.exact_times}")
    
    if treatment.medicines.count() == 0:
        print("\n❌ MEDICINES WERE NOT SAVED!")
    else:
        print(f"\n✓ SUCCESS! {treatment.medicines.count()} medicines saved correctly!")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
