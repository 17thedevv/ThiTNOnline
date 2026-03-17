import google.genai as genai

# Test your Gemini API key
def test_your_gemini():
    api_key = "AIzaSyCL2X4ghe_Ai5w1PKzhtqg0o3gPbWCJb5E"
    
    try:
        print("=== Testing YOUR Gemini API Key ===")
        print(f"Model: gemini-1.5-flash (FREE)")
        print(f"API Key: {api_key[:20]}...")
        
        # Create client
        client = genai.Client(api_key=api_key)
        
        # Test 1: Simple greeting
        print("\n1. Testing greeting...")
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Xin chào! Bạn là AI gì và có miễn phí không?"
        )
        print(f"Response: {response.text}")
        
        # Test 2: Education question
        print("\n2. Testing education support...")
        response2 = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Giải thích ngắn gọn về hệ thống thi trắc nghiệm online"
        )
        print(f"Response: {response2.text}")
        
        # Test 3: Complex question
        print("\n3. Testing complex reasoning...")
        response3 = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Tại sao học online lại hiệu quả trong thời đại số? Cho 3 lý do chính."
        )
        print(f"Response: {response3.text}")
        
        print("\n✅ SUCCESS! Your Gemini API is working!")
        print("✅ Model: gemini-1.5-flash (100% FREE)")
        print("✅ Ready for chatbot integration!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if "403" in str(e):
            print("🔑 API key issue - may need new key")

if __name__ == "__main__":
    test_your_gemini()
