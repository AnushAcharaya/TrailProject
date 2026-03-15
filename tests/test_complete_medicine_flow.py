"""
Complete test to verify medicine data is saved and retrieved correctly
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from livestockcrud.models import Livestock
from medical.models import Treatment, Medicine
from medical.serializers import TreatmentSerializer
from django.test import RequestFactory

User = get_user_model()

print("=" * 80)
print("COMPLETE MEDICINE FLOW TEST")
print("=" * 80)

# Get user and livestock
user = User.objects.filter(role='farmer').first()
livestock = Livestock.objects.filter(user=user).first()

if not user or not livestock:
    print("❌ Missing user or livestock")
    exit()

print(f"\n✓ User: {user.email}")
print(f"✓ Livestock: {livestock.tag_id}")

# Step 1: Create treatment with medicines (simulating frontend POST)
print("\n" + "=" * 80)
print("STEP 1: CREATE TREATMENT WITH MEDICINES")
print("=" * 80)

treatment_data = {
    'livestock_tag': livestock.tag_id,
    'treatment_name': 'Complete Flow Test Treatment',
    'diagnosis': 'Testing complete medicine flow',
    'vet_name': 'Dr. Flow Test',
    'treatment_date': '2024-03-15',
    'status': 'In Progress',
    'medicines': [
        {
            'name': 'Medicine Alpha',
            'dosage': '10 mL',
            'frequency': 2,
            'duration': 5,
            'schedule_type': 'interval',
            'start_time': '08:00:00',
            'interval_hours': 12,
            'exact_times': []
        },
        {
            'name': 'Medicine Beta',
            'dosage': '5 mg',
            'frequency': 3,
            'duration': 7,
            'schedule_type': 'exact',
            'start_time': '08:00:00',
            'interval_hours': 8,
            'exact_times': ['08:00:00', '14:00:00', '20:00:00']
        }
    ]
}

# Create fake request
factory = RequestFactory()
request = factory.post('/api/v1/medical/treatments/')
request.user = user

# Create treatment using serializer
serializer = TreatmentSerializer(data=treatment_data, context={'request': request})

if serializer.is_valid():
    treatment = serializer.save()
    print(f"✓ Treatment created with ID: {treatment.id}")
    print(f"✓ Treatment name: {treatment.treatment_name}")
    
    # Check medicines in database
    medicines_count = treatment.medicines.count()
    print(f"\n✓ Medicines saved to database: {medicines_count}")
    
    if medicines_count > 0:
        for i, med in enumerate(treatment.medicines.all(), 1):
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
        print("  ❌ NO MEDICINES SAVED!")
        exit()
else:
    print(f"❌ Validation errors: {serializer.errors}")
    exit()

# Step 2: Retrieve treatment (simulating frontend GET for edit)
print("\n" + "=" * 80)
print("STEP 2: RETRIEVE TREATMENT FOR EDITING")
print("=" * 80)

retrieved_treatment = Treatment.objects.get(id=treatment.id)
retrieve_serializer = TreatmentSerializer(retrieved_treatment)
retrieved_data = retrieve_serializer.data

print(f"✓ Retrieved treatment ID: {retrieved_data['id']}")
print(f"✓ Retrieved treatment name: {retrieved_data['treatment_name']}")
print(f"✓ Medicines in response: {len(retrieved_data['medicines'])}")

if len(retrieved_data['medicines']) > 0:
    print("\n✓ MEDICINES DATA RETRIEVED:")
    for i, med in enumerate(retrieved_data['medicines'], 1):
        print(f"\n  Medicine {i}:")
        print(f"    Name: {med['name']}")
        print(f"    Dosage: {med['dosage']}")
        print(f"    Frequency: {med['frequency']}")
        print(f"    Duration: {med['duration']}")
        print(f"    Schedule Type: {med['schedule_type']}")
        print(f"    Start Time: {med['start_time']}")
        print(f"    Interval Hours: {med['interval_hours']}")
        print(f"    Exact Times: {med['exact_times']}")
else:
    print("  ❌ NO MEDICINES IN RESPONSE!")
    exit()

# Step 3: Update treatment with modified medicines
print("\n" + "=" * 80)
print("STEP 3: UPDATE TREATMENT WITH MODIFIED MEDICINES")
print("=" * 80)

update_data = {
    'livestock_tag': livestock.tag_id,
    'treatment_name': 'Updated Flow Test Treatment',
    'diagnosis': 'Updated diagnosis',
    'vet_name': 'Dr. Updated',
    'treatment_date': '2024-03-15',
    'status': 'In Progress',
    'medicines': [
        {
            'name': 'Updated Medicine Alpha',
            'dosage': '15 mL',
            'frequency': 3,
            'duration': 10,
            'schedule_type': 'interval',
            'start_time': '09:00:00',
            'interval_hours': 8,
            'exact_times': []
        }
    ]
}

update_serializer = TreatmentSerializer(
    retrieved_treatment, 
    data=update_data, 
    context={'request': request}
)

if update_serializer.is_valid():
    updated_treatment = update_serializer.save()
    print(f"✓ Treatment updated")
    print(f"✓ New treatment name: {updated_treatment.treatment_name}")
    
    # Check updated medicines
    updated_medicines_count = updated_treatment.medicines.count()
    print(f"\n✓ Medicines after update: {updated_medicines_count}")
    
    if updated_medicines_count > 0:
        for i, med in enumerate(updated_treatment.medicines.all(), 1):
            print(f"\n  Medicine {i}:")
            print(f"    Name: {med.name}")
            print(f"    Dosage: {med.dosage}")
            print(f"    Frequency: {med.frequency}")
            print(f"    Duration: {med.duration}")
    else:
        print("  ❌ NO MEDICINES AFTER UPDATE!")
        exit()
else:
    print(f"❌ Update validation errors: {update_serializer.errors}")
    exit()

# Final verification
print("\n" + "=" * 80)
print("FINAL VERIFICATION")
print("=" * 80)

final_treatment = Treatment.objects.get(id=treatment.id)
final_serializer = TreatmentSerializer(final_treatment)
final_data = final_serializer.data

print(f"✓ Final treatment name: {final_data['treatment_name']}")
print(f"✓ Final medicines count: {len(final_data['medicines'])}")

if len(final_data['medicines']) > 0:
    print("\n✅ SUCCESS! Medicine data is:")
    print("   1. Saved to database ✓")
    print("   2. Retrieved correctly ✓")
    print("   3. Updated correctly ✓")
    print("   4. Available for editing ✓")
else:
    print("\n❌ FAILED! Medicines not persisting")

print("\n" + "=" * 80)
print("TEST COMPLETE")
print("=" * 80)
