from django.db import models
from exams.models import Exam
from django.conf import settings


class Submission(models.Model):
    STATUS_CHOICES = (
        ('auto', 'Chấm tự động'),
        ('approved', 'Đã phê duyệt'),
        ('rejected', 'Bị từ chối'),
    )

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='auto')
    teacher_note = models.TextField(blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.exam.title} - {self.score}"