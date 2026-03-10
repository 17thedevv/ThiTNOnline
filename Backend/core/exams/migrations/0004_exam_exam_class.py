from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("classes", "0002_class_code"),
        ("exams", "0003_question_exam"),
    ]

    operations = [
        migrations.AddField(
            model_name="exam",
            name="exam_class",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="exams",
                null=True,
                blank=True,
                to="classes.class",
            ),
        ),
    ]

