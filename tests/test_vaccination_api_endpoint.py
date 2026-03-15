#!/usr/bin/env python
"""Test vaccination API endpoint directly"""
import requests
import json

# Get token first (you'll need to replace with actual credentials)
print("Testing Vaccination API Endpoint")
print("=" * 60)

# Test GET /api/v1/vaccination/2/
url = "http://localhost:8000/api/v1/vaccination/2/"
print(f"\nGET {url}")

# You need to add your JWT token here
token = input("Enter your JWT token (from localStorage): ")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
    print(f"Response text: {response.text}")
