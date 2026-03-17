from django.db import models
from django.conf import settings
import string
import random


def generate_class_code(length=6):
    alphabet = string.ascii_uppercase + string.digits
    raw = "".join(random.choice(alphabet) for _ in range(length))
    return f"{raw[:3]}-{raw[3:]}"  # VD: ABC-123


class Class(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=16, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teaching_classes",
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="joined_classes",
        blank=True,
    )

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.code:
            while True:
                candidate = generate_class_code()
                if not Class.objects.filter(code=candidate).exists():
                    self.code = candidate
                    break
        super().save(*args, **kwargs)