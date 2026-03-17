import google.generativeai as genai
import os

# Test Google Gemini API directly
def test_gemini_direct():
    api_key = "AIzaSyCL2X4ghe_Ai5w1PKzhtqg0o3gPbWCJb5E"
    
    try:
        print("=== Testing Google Gemini API Directly ===")
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Test simple question
        response = model.generate_content("Xin chào, bạn là ai?")
        
        print(f"✅ Gemini API Success!")
        print(f"Response: {response.text}")
        
        # Test more complex question
        response2 = model.generate_content("Giải thích về hệ thống thi trắc nghiệm online")
        print(f"\n✅ Complex Question Success!")
        print(f"Response: {response2.text}")
        
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        print(f"Error Type: {type(e).__name__}")
        
        # Check common issues
        if "quota" in str(e).lower():
            print("💡 Issue: API quota exceeded or invalid API key")
        elif "network" in str(e).lower() or "connection" in str(e).lower():
            print("💡 Issue: Network connection problem")
        elif "permission" in str(e).lower() or "forbidden" in str(e).lower():
            print("💡 Issue: API key permission denied")
        else:
            print("💡 Issue: Unknown error - check API key and network")

if __name__ == "__main__":
    test_gemini_direct()
