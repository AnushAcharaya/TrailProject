#!/usr/bin/env python
"""
Test script to verify medical API authentication
Run this to check if the medical endpoint is working with a valid token
"""
import requests
import sys

BASE_URL = "http://localhost:8000"

def test_medical_auth():
    print("Testing Medical API Authentication...")
    print("-" * 50)
    
    # First, try to login and get a token
    print("\n1. Attempting to get a token...")
    print("   You need to login through the frontend first to get a valid token")
    print("   Or provide a token manually below\n")
    
    token = input("Enter your JWT token (or press Enter to skip): ").strip()
    
    if not token:
        print("\nNo token provided. Please:")
        print("1. Login through the frontend (http://localhost:5173)")
        print("2. Open browser console")
        print("3. Type: localStorage.getItem('token')")
        print("4. Copy the token and run this script again")
        return
    
    # Test the medical treatments endpoint
    print(f"\n2. Testing GET /api/v1/medical/treatments/")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/v1/medical/treatments/",
            headers=headers
        )
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✓ Authentication successful!")
            print(f"   Response: {response.json()}")
        elif response.status_code == 401:
            print("   ✗ 401 Unauthorized - Token is invalid or expired")
            print(f"   Response: {response.text}")
        else:
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")

if __name__ == "__main__":
    test_medical_auth()
