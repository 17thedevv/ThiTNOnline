import requests
import json

# Test AI Chatbot API (Public endpoint - no auth required)
def test_chatbot():
    url = "http://localhost:8000/api/chatbot/test/"
    headers = {
        "Content-Type": "application/json"
    }
    
    # Test messages
    test_messages = [
        "chào",
        "làm bài thi thế nào",
        "miễn phí không",
        "help"
    ]
    
    for message in test_messages:
        print(f"\n=== Testing: '{message}' ===")
        data = {
            "message": message,
            "conversation_history": []
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Mode: {result.get('mode', 'Unknown')}")
                print(f"Fallback: {result.get('fallback', 'Unknown')}")
                print(f"Response: {result.get('response', 'No response')}")
                if 'error' in result:
                    print(f"Error: {result['error']}")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"Request Error: {e}")
    
    print("\n=== Test completed ===")

if __name__ == "__main__":
    test_chatbot()
