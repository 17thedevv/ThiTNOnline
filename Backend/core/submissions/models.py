from django.db import models
from exams.models import Exam
from django.conf import settings

class Submission(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)