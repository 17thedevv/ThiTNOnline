from django.core.management.base import BaseCommand
from chatbot.ai_service import ai_service


class Command(BaseCommand):
    help = 'Check available AI models and their status'

    def handle(self, *args, **options):
        self.stdout.write('AI Service Status Check')
        self.stdout.write('=' * 50)
        
        models = ai_service.get_available_models()
        
        for model in models:
            status_color = 'SUCCESS' if model['status'] == 'available' else 'WARNING'
            status_icon = '✅' if model['status'] == 'available' else '❌'
            
            self.stdout.write(f"{status_icon} {model['provider']} - {model['name']}")
            self.stdout.write(f"   Status: {model['status']}")
            self.stdout.write('')
        
        self.stdout.write('=' * 50)
        
        # Test AI response
        self.stdout.write('Testing AI Response...')
        self.stdout.write('')
        
        test_message = "Xin chào, bạn có thể giúp tôi làm bài thi không?"
        
        try:
            response = ai_service.generate_response(test_message, {
                'user_role': 'student',
                'current_page': 'Danh sách bài thi'
            })
            
            if response:
                self.stdout.write('✅ AI Response Generated:')
                self.stdout.write(f"   {response['response']}")
                self.stdout.write(f"   Type: {response['response_type']}")
                self.stdout.write(f"   Model: {response.get('model_used', 'Unknown')}")
                self.stdout.write(f"   Confidence: {response.get('confidence_score', 'N/A')}")
            else:
                self.stdout.write('⚠️  No AI service available')
                self.stdout.write('   Chatbot will use rule-based responses only')
                
        except Exception as e:
            self.stdout.write(f'❌ Error testing AI: {str(e)}')
        
        self.stdout.write('')
        self.stdout.write('Configuration Instructions:')
        self.stdout.write('   1. Copy .env.example to .env')
        self.stdout.write('   2. Add your API keys to .env file')
        self.stdout.write('   3. Gemini is free and has priority')
        self.stdout.write('   4. OpenAI is used as fallback')
