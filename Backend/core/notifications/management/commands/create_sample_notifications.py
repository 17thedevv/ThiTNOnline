from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.utils import create_notification

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample notifications for testing'

    def handle(self, *args, **options):
        # Lấy user đầu tiên làm recipient
        try:
            user = User.objects.first()
            if not user:
                self.stdout.write(self.style.ERROR('No users found. Please create a user first.'))
                return

            # Tạo thông báo mẫu
            notifications = [
                {
                    'title': 'Bạn có bài kiểm tra mới',
                    'message': 'Lớp Lập trình Web vừa đăng bài kiểm tra mới',
                    'type': 'exam_new'
                },
                {
                    'title': 'Bạn đã được thêm vào lớp mới',
                    'message': 'Bạn vừa tham gia lớp Cơ sở dữ liệu',
                    'type': 'class_joined'
                },
                {
                    'title': 'Kết quả đã có',
                    'message': 'Điểm bài Toán chương 1 đã được công bố',
                    'type': 'exam_result'
                }
            ]

            created_count = 0
            for notif_data in notifications:
                create_notification(
                    recipients=[user],
                    title=notif_data['title'],
                    message=notif_data['message'],
                    notification_type=notif_data['type']
                )
                created_count += 1

            self.stdout.write(
                self.style.SUCCESS(f'Successfully created {created_count} notifications for user {user.username}')
            )

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating notifications: {str(e)}'))
