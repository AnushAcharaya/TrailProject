"""
Test script for Login OTP functionality
Run this after starting Django server and Celery worker
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1/auth"

def test_login_otp_flow():
    print("=" * 60)
    print("TESTING LOGIN OTP FLOW")
    print("=" * 60)
    
    # Test data - update with your actual user credentials
    test_user = {
        "email": "test@example.com",  # Replace with actual email
        "phone": "+1234567890",        # Replace with actual phone
        "password": "testpassword123", # Replace with actual password
        "role": "farmer"               # or "vet" or "admin"
    }
    
    print("\n1. Testing Send Login OTP...")
    print(f"   Email: {test_user['email']}")
    print(f"   Role: {test_user['role']}")
    
    # Step 1: Send OTP
    response = requests.post(
        f"{BASE_URL}/login/send-otp/",
        json=test_user,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\n   Response Status: {response.status_code}")
    print(f"   Response Body: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("\n   ✓ OTP sent successfully!")
        print("\n   Check your:")
        print("   - Email inbox for email OTP")
        if test_user['role'] in ['farmer', 'vet']:
            if os.getenv('ENABLE_SMS_OTP', 'False') == 'True':
                print("   - Phone for SMS OTP")
            else:
                print("   - Email inbox for phone OTP (SMS disabled)")
        print("\n   - Django console/Celery worker logs for OTP codes")
        
        # Prompt for OTP codes
        print("\n2. Enter OTP codes to verify:")
        email_otp = input("   Email OTP (6 digits): ")
        
        phone_otp = ""
        if test_user['role'] in ['farmer', 'vet']:
            phone_otp = input("   Phone OTP (6 digits): ")
        
        # Step 2: Verify OTP
        verify_data = {
            "email": test_user['email'],
            "email_code": email_otp,
            "phone_code": phone_otp,
            "role": test_user['role']
        }
        
        print("\n3. Testing Verify Login OTP...")
        verify_response = requests.post(
            f"{BASE_URL}/login/verify-otp/",
            json=verify_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n   Response Status: {verify_response.status_code}")
        print(f"   Response Body: {json.dumps(verify_response.json(), indent=2)}")
        
        if verify_response.status_code == 200:
            print("\n   ✓ Login successful!")
            data = verify_response.json()
            print(f"\n   Access Token: {data.get('access', 'N/A')[:50]}...")
            print(f"   User: {data.get('user', {}).get('full_name', 'N/A')}")
        else:
            print("\n   ✗ Verification failed!")
    else:
        print("\n   ✗ Failed to send OTP!")
        print("\n   Common issues:")
        print("   - User doesn't exist")
        print("   - Wrong password")
        print("   - Wrong role")
        print("   - Account not approved (for farmer/vet)")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    import os
    test_login_otp_flow()
