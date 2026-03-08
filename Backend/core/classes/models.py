from django.db import models
from django.conf import settings

class Class(models.Model):
    name = models.CharField(max_length=255)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teaching_classes'
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='joined_classes'
    )

    def __str__(self):
        return self.name