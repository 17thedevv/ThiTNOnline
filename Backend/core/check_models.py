import google.genai as genai

# List available models
def check_available_models():
    api_key = "AIzaSyCL2X4ghe_Ai5w1PKzhtqg0o3gPbWCJb5E"
    
    try:
        client = genai.Client(api_key=api_key)
        
        print("=== Available Models for Generate Content ===")
        models = client.models.list()
        
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"Model: {model.name}")
                print(f"Display Name: {model.display_name}")
                print(f"Description: {model.description}")
                print("-" * 50)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_available_models()
