# Generated manually

from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0003_alter_class_students'),
    ]

    operations = [
        migrations.AddField(
            model_name='class',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
        ),
    ]
