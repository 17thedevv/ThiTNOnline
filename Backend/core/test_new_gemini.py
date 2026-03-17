import google.genai as genai

# Test with new google-genai package
def test_new_gemini():
    # You need to get a new API key from: https://aistudio.google.com/app/apikey
    api_key = "YOUR_NEW_GEMINI_API_KEY_HERE"
    
    try:
        client = genai.Client(api_key=api_key)
        
        # Test simple question
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents="Xin chào, bạn là ai?"
        )
        
        print("✅ Gemini Success!")
        print(response.text)
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Go to https://aistudio.google.com/app/apikey to get new API key")
    test_new_gemini()
