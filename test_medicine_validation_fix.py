"""
Test to verify medicine validation fix
This test checks that:
1. Medicines with correct frequency/exact_times match are saved
2. Medicines with mismatched frequency/exact_times are rejected with clear error
"""

import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from medical.serializers import MedicineSerializer

def test_valid_medicine():
    """Test that valid medicine data passes validation"""
    print("\n" + "="*60)
    print("TEST 1: Valid medicine with frequency=2 and 2 exact times")
    print("="*60)
    
    data = {
        'name': 'Amoxicillin',
        'dosage': '500mg',
        'frequency': 2,
        'duration': 7,
        'schedule_type': 'exact',
        'start_time': '08:00',
        'exact_times': ['08:00', '20:00']  # 2 times for frequency=2
    }
    
    serializer = MedicineSerializer(data=data)
    is_valid = serializer.is_valid()
    
    print(f"Data: {data}")
    print(f"Is valid: {is_valid}")
    if not is_valid:
        print(f"Errors: {serializer.errors}")
    else:
        print("✓ PASSED: Medicine with matching frequency and exact_times is valid")
    
    return is_valid

def test_invalid_medicine():
    """Test that invalid medicine data fails validation"""
    print("\n" + "="*60)
    print("TEST 2: Invalid medicine with frequency=2 but 3 exact times")
    print("="*60)
    
    data = {
        'name': 'Amoxicillin',
        'dosage': '500mg',
        'frequency': 2,
        'duration': 7,
        'schedule_type': 'exact',
        'start_time': '08:00',
        'exact_times': ['08:00', '13:00', '18:00']  # 3 times for frequency=2 - WRONG!
    }
    
    serializer = MedicineSerializer(data=data)
    is_valid = serializer.is_valid()
    
    print(f"Data: {data}")
    print(f"Is valid: {is_valid}")
    if not is_valid:
        print(f"Errors: {serializer.errors}")
        print("✓ PASSED: Medicine with mismatched frequency and exact_times is rejected")
    else:
        print("✗ FAILED: Medicine should have been rejected!")
    
    return not is_valid  # Should be invalid

def test_interval_schedule():
    """Test that interval schedule works correctly"""
    print("\n" + "="*60)
    print("TEST 3: Valid medicine with interval schedule")
    print("="*60)
    
    data = {
        'name': 'Paracetamol',
        'dosage': '250mg',
        'frequency': 3,
        'duration': 5,
        'schedule_type': 'interval',
        'start_time': '08:00',
        'interval_hours': 8
    }
    
    serializer = MedicineSerializer(data=data)
    is_valid = serializer.is_valid()
    
    print(f"Data: {data}")
    print(f"Is valid: {is_valid}")
    if not is_valid:
        print(f"Errors: {serializer.errors}")
    else:
        print("✓ PASSED: Medicine with interval schedule is valid")
    
    return is_valid

if __name__ == '__main__':
    print("\n" + "="*60)
    print("MEDICINE VALIDATION FIX TEST SUITE")
    print("="*60)
    
    test1 = test_valid_medicine()
    test2 = test_invalid_medicine()
    test3 = test_interval_schedule()
    
    print("\n" + "="*60)
    print("TEST RESULTS SUMMARY")
    print("="*60)
    print(f"Test 1 (Valid exact schedule): {'✓ PASSED' if test1 else '✗ FAILED'}")
    print(f"Test 2 (Invalid exact schedule): {'✓ PASSED' if test2 else '✗ FAILED'}")
    print(f"Test 3 (Valid interval schedule): {'✓ PASSED' if test3 else '✗ FAILED'}")
    
    all_passed = test1 and test2 and test3
    print("\n" + "="*60)
    if all_passed:
        print("✓ ALL TESTS PASSED!")
    else:
        print("✗ SOME TESTS FAILED!")
    print("="*60 + "\n")
    
    sys.exit(0 if all_passed else 1)
