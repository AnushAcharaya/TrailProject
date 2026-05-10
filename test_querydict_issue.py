"""
Test to see if QueryDict.dict() is the problem
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.http import QueryDict
import json

# Simulate FormData with medicines as JSON string
qd = QueryDict(mutable=True)
qd['livestock_tag'] = 'RS00001'
qd['treatment_name'] = 'Test'
qd['medicines'] = json.dumps([
    {
        'name': 'Paracetamol',
        'dosage': '500mg',
        'frequency': 2,
        'duration': 3,
        'schedule_type': 'interval',
        'start_time': '08:00',
        'interval_hours': 8,
        'exact_times': ['08:00', '16:00']
    }
])

print("QueryDict:")
print(f"  Type: {type(qd)}")
print(f"  Keys: {list(qd.keys())}")
print(f"  medicines value: {qd['medicines'][:100]}...")

# Convert to dict
data = qd.dict()

print("\nAfter .dict():")
print(f"  Type: {type(data)}")
print(f"  Keys: {list(data.keys())}")
print(f"  medicines value: {data['medicines'][:100]}...")
print(f"  medicines type: {type(data['medicines'])}")

# Parse JSON
parsed = json.loads(data['medicines'])
print("\nAfter JSON parse:")
print(f"  Type: {type(parsed)}")
print(f"  Length: {len(parsed)}")
print(f"  First item: {parsed[0]}")

data['medicines'] = parsed
print("\nFinal data:")
print(f"  medicines type: {type(data['medicines'])}")
print(f"  medicines length: {len(data['medicines'])}")
print(f"  medicines value: {data['medicines']}")
