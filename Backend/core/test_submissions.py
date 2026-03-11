import requests
import json

# Test submissions endpoint
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
        
        # Test submissions for class ID 6
        print("\nTesting submissions for class ID 6...")
        submissions_response = requests.get(f"{base_url}/api/submissions/class/6/", headers=headers)
        print(f"Submissions status: {submissions_response.status_code}")
        if submissions_response.status_code == 200:
            data = submissions_response.json()
            print(f"Number of submissions: {len(data)}")
            for sub in data:
                print(f"  - Exam: {sub.get('exam_title', 'N/A')}, Student: {sub.get('student_username', 'N/A')}")
        else:
            print("Response received but with error")
        
        # Also test submissions for class ID 2 (user's class)
        print("\nTesting submissions for class ID 2...")
        submissions_response2 = requests.get(f"{base_url}/api/submissions/class/2/", headers=headers)
        print(f"Submissions status: {submissions_response2.status_code}")
        if submissions_response2.status_code == 200:
            data = submissions_response2.json()
            print(f"Number of submissions: {len(data)}")
        else:
            print(f"Response: {submissions_response2.text[:200]}...")
        
    else:
        print(f"Login failed: {login_response.text}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
