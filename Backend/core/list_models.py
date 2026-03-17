import google.generativeai as genai

# List available models
def list_models():
    api_key = "AIzaSyCL2X4ghe_Ai5w1PKzhtqg0o3gPbWCJb5E"
    
    try:
        genai.configure(api_key=api_key)
        
        print("=== Available Models ===")
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                print(f"Model: {model.name}")
                print(f"Display Name: {model.display_name}")
                print(f"Description: {model.description}")
                print("-" * 50)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_models()
