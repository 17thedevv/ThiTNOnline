import google.genai as genai

# Test Gemini with new API key
def test_gemini_new_api():
    # You need to replace this with your NEW API key
    # Get it from: https://aistudio.google.com/app/apikey
    api_key = "YOUR_NEW_GEMINI_API_KEY_HERE"
    
    try:
        print("=== Testing Gemini AI (New Package) ===")
        print(f"API Key: {api_key[:20]}...")  # Show first 20 chars
        
        # Create client
        client = genai.Client(api_key=api_key)
        
        # Test simple question
        print("\nTesting simple greeting...")
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Xin chào, bạn là ai?"
        )
        print("Success!")
        print(f"Response: {response.text}")
        
        # Test complex question
        print("\nTesting education question...")
        response2 = client.models.generate_content(
            model="gemini-1.5-flash", 
            contents="Giải thích về hệ thống thi trắc nghiệm online cho người mới bắt đầu"
        )
        print("Success!")
        print(f"Response: {response2.text}")
        
        print("\nGemini API working perfectly!")
        
    except Exception as e:
        print(f"Error: {e}")
        print("\nSolutions:")
        if "403" in str(e) or "forbidden" in str(e).lower():
            print("• API key bị leak hoặc không hợp lệ")
            print("• Hãy tạo API key mới tại: https://aistudio.google.com/app/apikey")
        elif "quota" in str(e).lower():
            print("• Het quota (vẫn miễn phí nhưng có giới hạn)")
            print("• Thử lại sau vài phút")
        elif "network" in str(e).lower():
            print("• Lỗi kết nối mạng")
            print("• Kiểm tra internet")
        else:
            print("• Kiểm tra API key và kết nối")

if __name__ == "__main__":
    print("Instructions:")
    print("1. Go to: https://aistudio.google.com/app/apikey")
    print("2. Create new API key")
    print("3. Replace YOUR_NEW_GEMINI_API_KEY_HERE in this script")
    print("4. Run this script again")
    print("\n" + "="*50)
    test_gemini_new_api()
