import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from classes.models import Class

User = get_user_model()

# Get user traluong196
try:
    user = User.objects.get(username='traluong196')
    print(f"User: {user.username}, Role: {user.role}")
    
    # Check what classes user can access
    if user.role == 'teacher':
        teaching_classes = Class.objects.filter(teacher=user)
        print(f"Teaching classes: {list(teaching_classes.values('id', 'name'))}")
    
    if user.role == 'student':
        joined_classes = Class.objects.filter(students=user)
        print(f"Joined classes: {list(joined_classes.values('id', 'name'))}")
    
    if user.role == 'admin':
        all_classes = Class.objects.all()
        print(f"All classes: {list(all_classes.values('id', 'name'))}")
    
    # Check if class ID 6 exists
    try:
        class_6 = Class.objects.get(id=6)
        print(f"Class ID 6 exists: {class_6.name}")
        print(f"Teacher: {class_6.teacher.username}")
        print(f"Students: {[s.username for s in class_6.students.all()]}")
    except Class.DoesNotExist:
        print("Class ID 6 does not exist")
        
        # Create class ID 6 for testing
        new_class = Class.objects.create(
            id=6,  # Force ID 6
            name="K22d",
            teacher=user
        )
        print(f"Created class ID 6: {new_class.name}")
        
except User.DoesNotExist:
    print("User traluong196 not found")
