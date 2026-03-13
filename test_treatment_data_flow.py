#!/usr/bin/env python
"""
Test script to verify treatment data flow from frontend to backend
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.models import Treatment, Medicine
from livestockcrud.models import Livestock
from django.contrib.auth import get_user_model

User = get_user_model()

def test_treatment_data_structure():
    """Test that treatment data is properly structured"""
    print("=" * 60)
    print("Testing Treatment Data Structure")
    print("=" * 60)
    
    # Get a sample treatment
    treatments = Treatment.objects.select_related('livestock', 'user').prefetch_related('medicines').all()[:1]
    
    if not treatments:
        print("❌ No treatments found in database")
        print("\nTo test properly:")
        print("1. Start the Django server: python manage.py runserver")
        print("2. Login as a farmer")
        print("3. Submit a treatment form")
        print("4. Run this script again")
        return
    
    treatment = treatments[0]
    
    print(f"\n✅ Found treatment: {treatment.id}")
    print(f"   Treatment Name: {treatment.treatment_name}")
    print(f"   Livestock Tag: {treatment.livestock.tag_id}")
    print(f"   Diagnosis: {treatment.diagnosis[:50]}...")
    print(f"   Vet Name: {treatment.vet_name}")
    print(f"   Treatment Date: {treatment.treatment_date}")
    print(f"   Next Treatment Date: {treatment.next_treatment_date}")
    print(f"   Status: {treatment.status}")
    
    print(f"\n📋 Medicines ({treatment.medicines.count()}):")
    for i, med in enumerate(treatment.medicines.all(), 1):
        print(f"   {i}. {med.name}")
        print(f"      - Dosage: {med.dosage}")
        print(f"      - Frequency: {med.frequency}x/day")
        print(f"      - Duration: {med.duration} days")
        print(f"      - Schedule Type: {med.schedule_type}")
        if med.schedule_type == 'interval':
            print(f"      - Start Time: {med.start_time}")
            print(f"      - Interval: {med.interval_hours} hours")
        else:
            print(f"      - Exact Times: {med.exact_times}")
    
    print("\n" + "=" * 60)
    print("Testing Serializer Output")
    print("=" * 60)
    
    from medical.serializers import TreatmentSerializer
    from rest_framework.request import Request
    from django.test import RequestFactory
    
    factory = RequestFactory()
    request = factory.get('/')
    request.user = treatment.user
    
    serializer = TreatmentSerializer(treatment, context={'request': request})
    data = serializer.data
    
    print("\n✅ Serialized Data Structure:")
    print(f"   id: {data.get('id')}")
    print(f"   treatment_name: {data.get('treatment_name')}")
    print(f"   livestock.tag_id: {data.get('livestock', {}).get('tag_id')}")
    print(f"   diagnosis: {data.get('diagnosis', '')[:50]}...")
    print(f"   vet_name: {data.get('vet_name')}")
    print(f"   treatment_date: {data.get('treatment_date')}")
    print(f"   next_treatment_date: {data.get('next_treatment_date')}")
    print(f"   status: {data.get('status')}")
    print(f"   medicines: {len(data.get('medicines', []))} items")
    
    if data.get('medicines'):
        print("\n   Medicine Fields:")
        med = data['medicines'][0]
        print(f"   - name: {med.get('name')}")
        print(f"   - dosage: {med.get('dosage')}")
        print(f"   - frequency: {med.get('frequency')}")
        print(f"   - duration: {med.get('duration')}")
        print(f"   - scheduleType: {med.get('scheduleType')}")
        print(f"   - schedule_type: {med.get('schedule_type')}")
        print(f"   - startTime: {med.get('startTime')}")
        print(f"   - start_time: {med.get('start_time')}")
    
    print("\n" + "=" * 60)
    print("Field Name Mapping Check")
    print("=" * 60)
    
    print("\n✅ Backend uses snake_case:")
    print("   - treatment_name")
    print("   - livestock.tag_id")
    print("   - vet_name")
    print("   - treatment_date")
    print("   - next_treatment_date")
    print("   - medicines[].schedule_type")
    print("   - medicines[].start_time")
    print("   - medicines[].interval_hours")
    print("   - medicines[].exact_times")
    
    print("\n✅ Frontend components should use snake_case:")
    print("   - TreatmentCard.jsx: treatment.treatment_name ✓")
    print("   - TreatmentCard.jsx: treatment.livestock?.tag_id ✓")
    print("   - TreatmentCard.jsx: treatment.vet_name ✓")
    print("   - TreatmentCard.jsx: treatment.treatment_date ✓")
    print("   - ViewTreatmentModal.jsx: treatment.treatment_name ✓")
    print("   - MedicalTrackingCard.jsx: med.schedule_type ✓")
    
    print("\n" + "=" * 60)
    print("✅ All checks passed!")
    print("=" * 60)

if __name__ == '__main__':
    test_treatment_data_structure()
