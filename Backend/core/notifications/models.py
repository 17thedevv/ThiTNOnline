from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = (
        ('exam_new', 'Bài kiểm tra mới'),
        ('class_new', 'Lớp học mới'),
        ('exam_result', 'Kết quả bài thi'),
        ('class_joined', 'Tham gia lớp'),
        ('system', 'Hệ thống'),
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='system'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional related objects
    exam = models.ForeignKey(
        'exams.Exam',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    class_obj = models.ForeignKey(
        'classes.Class',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
