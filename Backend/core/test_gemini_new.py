import google.generativeai as genai
import os

# Test Google Gemini API with new package
def test_gemini_new():
    api_key = "AIzaSyCL2X4ghe_Ai5w1PKzhtqg0o3gPbWCJb5E"
    
    try:
        print("=== Testing Google Gemini API (New Package) ===")
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Test simple question
        response = model.generate_content("Xin chao, ban la ai?")
        
        print("Success! Response:")
        print(response.text)
        
        # Test complex question
        response2 = model.generate_content("Giai thich ve he thống thi trắc nghiệm online cho người mới bắt đầu")
        print("\nComplex question response:")
        print(response2.text)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gemini_new()
