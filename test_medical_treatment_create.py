import requests
import json

# Test the medical treatment creation endpoint
BASE_URL = "http://localhost:8000"

# You'll need to replace this with a valid token
TOKEN = "your_token_here"

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

# Test data matching the frontend structure
treatment_data = {
    "livestock_tag": "COW-001",  # Replace with actual tag
    "treatment_name": "Test Treatment",
    "diagnosis": "Test diagnosis",
    "vet_name": "Dr. Test",
    "treatment_date": "2026-03-11",
    "status": "In Progress",
    "medicines": json.dumps([
        {
            "name": "Test Medicine",
            "dosage": "5 mL",
            "frequency": 2,
            "duration": 3,
            "scheduleType": "interval",
            "startTime": "08:00",
            "intervalHours": 8
        }
    ])
}

response = requests.post(
    f"{BASE_URL}/api/v1/medical/treatments/",
    data=treatment_data,
    headers=headers
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
