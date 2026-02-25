import requests

# Test species API
print("Testing Species API...")
try:
    response = requests.get('http://localhost:8000/api/v1/livestock/species/')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print(f"Number of species: {len(response.json())}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test breeds API
print("Testing Breeds API...")
try:
    response = requests.get('http://localhost:8000/api/v1/livestock/breeds/')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print(f"Number of breeds: {len(response.json())}")
except Exception as e:
    print(f"Error: {e}")
