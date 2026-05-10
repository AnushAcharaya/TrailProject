"""
Simple test to verify medicines are saved and returned correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from medical.models import Treatment, Medicine
from medical.serializers import TreatmentSerializer
from livestockcrud.models import Livestock
from datetime import date

User = get_user_model()

def test_medicine_serialization():
    print("\n" + "="*60)
    print("TESTING: Medicine Serialization Fix")
    print("="*60)
    
    # Get or create test user
    user = User.objects.filter(role='farmer').first()
    if not user:
        print("❌ No farmer user found")
        return False
    print(f"✓ Using user: {user.username}")
    
    # Get livestock
    livestock = Livestock.objects.filter(user=user).first()
    if not livestock:
        livestock = Livestock.objects.first()
    if not livestock:
        print("❌ No livestock found")
        return False
    print(f"✓ Using livestock: {livestock.tag_id}")
    
    # Prepare data
    medicines_data = [
        {
            "name": "Test Med 1",
            "dosage": "100mg",
            "frequency": 2,
            "duration": 5,
            "schedule_type": "interval",
            "start_time": "08:00",
            "interval_hours": 12
        },
        {
            "name": "Test Med 2",
            "dosage": "50mg",
            "frequency": 3,
            "duration": 7,
            "schedule_type": "exact",
            "start_time": "09:00",
            "exact_times": ["09:00", "14:00", "19:00"]
        }
    ]
    
    data = {
        'livestock_tag': livestock.tag_id,
        'treatment_name': 'Test Treatment',
        'diagnosis': 'Test Diagnosis',
        'vet_name': 'Dr. Test',
        'treatment_date': str(date.today()),
        'status': 'In Progress',
        'medicines': medicines_data
    }
    
    print(f"\n📝 Creating treatment with {len(medicines_data)} medicines...")
    
    # Create treatment using serializer
    serializer = TreatmentSerializer(data=data, context={'request': type('obj', (object,), {'user': user})()})
    
    if not serializer.is_valid():
        print(f"❌ Validation failed: {serializer.errors}")
        return False
    
    print(f"✓ Validation passed")
    
    # Save the treatment
    treatment = serializer.save()
    print(f"✓ Treatment created: ID={treatment.id}")
    
    # Check database
    db_count = treatment.medicines.count()
    print(f"\n📊 Database check:")
    print(f"   Medicines in DB: {db_count}")
    for med in treatment.medicines.all():
        print(f"      - {med.name} ({med.dosage})")
    
    # Now re-serialize to get the response data (this is what the fix does)
    response_serializer = TreatmentSerializer(treatment)
    response_medicines = response_serializer.data.get('medicines', [])
    
    print(f"\n📤 Serialized response:")
    print(f"   Medicines in response: {len(response_medicines)}")
    for med in response_medicines:
        print(f"      - {med['name']} ({med['dosage']})")
    
    # Verify
    if db_count == len(medicines_data) and len(response_medicines) == len(medicines_data):
        print(f"\n✅ SUCCESS!")
        print(f"   ✓ Database has {db_count} medicines")
        print(f"   ✓ Response has {len(response_medicines)} medicines")
        print(f"   ✓ All counts match!")
        
        # Cleanup
        treatment.delete()
        print(f"\n🧹 Cleaned up test data")
        return True
    else:
        print(f"\n❌ FAILED!")
        print(f"   Expected: {len(medicines_data)} medicines")
        print(f"   DB has: {db_count}")
        print(f"   Response has: {len(response_medicines)}")
        treatment.delete()
        return False

if __name__ == '__main__':
    try:
        success = test_medicine_serialization()
        print("\n" + "="*60)
        if success:
            print("✅ FIX VERIFIED: Medicines are correctly returned!")
        else:
            print("❌ FIX FAILED: Issue still exists")
        print("="*60 + "\n")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
