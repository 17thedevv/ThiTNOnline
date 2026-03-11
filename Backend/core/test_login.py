import requests
import json

# Test login endpoint
base_url = "http://localhost:8000"

# Test with different credentials
test_credentials = [
    {"username": "traluong196", "password": "password123"},
    {"username": "testuser", "password": "testpassword123"},
    {"username": "admin", "password": "admin123"},
    {"username": "", "password": "test"},  # Empty username
    {"username": "test", "password": ""},  # Empty password
]

for i, creds in enumerate(test_credentials):
    print(f"\n--- Test {i+1}: {creds['username']} / {'*' * len(creds['password']) if creds['password'] else 'empty'} ---")
    
    try:
        response = requests.post(f"{base_url}/api/token/", json=creds)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Token received: {bool(data.get('access'))}")
            print(f"Refresh token: {bool(data.get('refresh'))}")
        else:
            print(f"Error: {response.text[:200]}...")
            
    except Exception as e:
        print(f"Request error: {e}")

print(f"\n--- Testing with raw form data ---")
try:
    # Test with form data instead of JSON
    form_data = {
        'username': 'traluong196',
        'password': 'password123'
    }
    response = requests.post(f"{base_url}/api/token/", data=form_data)
    print(f"Form data status: {response.status_code}")
    print(f"Form data response: {response.text[:200]}...")
except Exception as e:
    print(f"Form data error: {e}")
