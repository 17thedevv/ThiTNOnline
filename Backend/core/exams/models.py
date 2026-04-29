from django.db import models
from django.conf import settings


class Exam(models.Model):
    title = models.CharField(max_length=255)
    duration = models.IntegerField()
    subject = models.ForeignKey(
        "subjects.Subject",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="exams",
    )
    # Giữ lại exam_class để tương thích ngược trong quá trình migration
    exam_class = models.ForeignKey(
        "classes.Class",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="exams",
    )
    max_attempts = models.IntegerField(null=True, blank=True, default=None)
    due_date = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)


class Question(models.Model):
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='questions',
        null=True,
        blank=True,
    )
    subject = models.ForeignKey(
        'subjects.Subject',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='questions'
    )
    question_text = models.TextField()
    image = models.ImageField(upload_to='question_images/', null=True, blank=True)

    option_a = models.CharField(max_length=255, default="")
    option_b = models.CharField(max_length=255, default="")
    option_c = models.CharField(max_length=255, default="")
    option_d = models.CharField(max_length=255, default="")

    correct_answer = models.CharField(max_length=1, default="A")