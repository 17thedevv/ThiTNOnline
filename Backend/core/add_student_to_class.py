import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from classes.models import Class

User = get_user_model()

# Add traluong196 as student to class ID 6
try:
    user = User.objects.get(username='traluong196')
    class_6 = Class.objects.get(id=6)
    
    class_6.students.add(user)
    print(f"Added {user.username} as student to class {class_6.name}")
    
    # Verify
    students = class_6.students.all()
    print(f"Class students: {[s.username for s in students]}")
    
except Exception as e:
    print(f"Error: {e}")
