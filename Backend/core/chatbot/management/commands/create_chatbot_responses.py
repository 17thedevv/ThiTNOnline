from django.core.management.base import BaseCommand
from chatbot.service import chatbot_service


class Command(BaseCommand):
    help = 'Create default chatbot responses'

    def handle(self, *args, **options):
        try:
            chatbot_service.create_default_responses()
            self.stdout.write(
                self.style.SUCCESS('Successfully created default chatbot responses')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating default responses: {str(e)}')
            )
