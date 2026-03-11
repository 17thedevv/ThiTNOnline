from django.core.management.base import BaseCommand
from chatbot.service import chatbot_service
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Test AI integration with chatbot'

    def add_arguments(self, parser):
        parser.add_argument(
            '--message',
            type=str,
            default='Xin chào, tôi cần giúp đỡ',
            help='Test message to send to chatbot'
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='User ID to test with (defaults to first user)'
        )

    def handle(self, *args, **options):
        message = options['message']
        user_id = options.get('user_id')
        
        try:
            # Get user
            if user_id:
                user = User.objects.get(id=user_id)
            else:
                user = User.objects.first()
                
            if not user:
                self.stdout.write(
                    self.style.ERROR('No users found. Please create a user first.')
                )
                return

            self.stdout.write(
                self.style.SUCCESS(f'Testing with user: {user.username} (ID: {user.id})')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Message: {message}')
            )
            self.stdout.write('-' * 50)

            # Test chatbot response
            response = chatbot_service.process_message(
                user=user,
                message=message
            )

            self.stdout.write(
                self.style.SUCCESS(f'Bot Response: {response["message"]}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Response Type: {response["response_type"]}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'Confidence Score: {response.get("confidence_score", "N/A")}')
            )
            
            if response.get('quick_replies'):
                self.stdout.write(
                    self.style.SUCCESS(f'Quick Replies: {response["quick_replies"]}')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error testing AI: {str(e)}')
            )
