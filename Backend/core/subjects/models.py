from django.db import models

class Subject(models.Model):
    name = models.CharField(max_length=255)
    class_obj = models.ForeignKey(
        "classes.Class",
        on_delete=models.CASCADE,
        related_name="subjects",
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.name