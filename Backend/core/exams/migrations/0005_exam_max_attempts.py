from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("exams", "0004_exam_exam_class"),
    ]

    operations = [
        migrations.AddField(
            model_name="exam",
            name="max_attempts",
            field=models.IntegerField(null=True, blank=True, default=None),
        ),
    ]

