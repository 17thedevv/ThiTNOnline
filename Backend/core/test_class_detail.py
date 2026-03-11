import requests
import json

# Test class detail endpoint
base_url = "http://localhost:8000"

# Login first
login_data = {
    "username": "traluong196",
    "password": "password123"
}

try:
    print("Testing login...")
    login_response = requests.post(f"{base_url}/api/token/", json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        access_token = token_data.get('access')
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Test class detail for class ID 6
        print("\nTesting class detail for class ID 6...")
        class_response = requests.get(f"{base_url}/api/classes/6/", headers=headers)
        print(f"Class detail status: {class_response.status_code}")
        print(f"Response available: {bool(class_response.text)}")
        
        # Also test list classes to see what classes exist
        print("\nTesting list classes...")
        list_response = requests.get(f"{base_url}/api/classes/", headers=headers)
        print(f"List classes status: {list_response.status_code}")
        if list_response.status_code == 200:
            classes = list_response.json()
            print(f"Number of classes: {len(classes)}")
            for cls in classes:
                print(f"  - ID: {cls.get('id')}, Name: {cls.get('name', 'N/A')}")
        else:
            print(f"List classes error: {list_response.status_code}")
        
    else:
        print(f"Login failed: {login_response.text}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
