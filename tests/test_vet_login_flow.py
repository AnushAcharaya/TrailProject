"""
Test script to verify the vet login flow and profile access
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_vet_login_flow():
    print("=" * 60)
    print("Testing Vet Login Flow")
    print("=" * 60)
    
    # Step 1: Send Login OTP
    print("\n1. Sending login OTP...")
    login_data = {
        "email": "vet@example.com",  # Replace with actual vet email
        "phone": "+1234567890",       # Replace with actual vet phone
        "password": "password123",    # Replace with actual password
        "role": "vet"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login/send-otp/",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code != 200:
        print("\n❌ Failed to send OTP. Please check credentials.")
        return
    
    # Step 2: Get OTP from user
    print("\n2. Enter the OTP sent to your email:")
    email_otp = input("Email OTP: ").strip()
    
    # Step 3: Verify OTP
    print("\n3. Verifying OTP...")
    verify_data = {
        "email": login_data["email"],
        "email_code": email_otp,
        "phone_code": "",  # Phone OTP not required
        "role": "vet"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login/verify-otp/",
        json=verify_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code != 200:
        print("\n❌ Failed to verify OTP.")
        return
    
    # Extract token
    data = response.json()
    access_token = data.get('access')
    
    if not access_token:
        print("\n❌ No access token in response.")
        return
    
    print(f"\n✅ Login successful! Token: {access_token[:30]}...")
    
    # Step 4: Test Profile Access
    print("\n4. Testing profile access...")
    response = requests.get(
        f"{BASE_URL}/api/v1/profile/",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("\n✅ Profile access successful!")
    else:
        print(f"Response: {response.text}")
        print("\n❌ Failed to access profile.")
        
        # Debug: Check token format
        print("\nDebug Info:")
        print(f"Token length: {len(access_token)}")
        print(f"Token starts with: {access_token[:10]}")
        print(f"Authorization header: Bearer {access_token[:30]}...")

if __name__ == "__main__":
    test_vet_login_flow()
