import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("Checking all users:")
for user in User.objects.all():
    print(f"  - Username: {user.username}, Email: {user.email}, Role: {user.role}, Active: {user.is_active}")

print("\nChecking if testuser exists:")
try:
    testuser = User.objects.get(username='testuser')
    print(f"testuser exists: {testuser.email}, Active: {testuser.is_active}")
except User.DoesNotExist:
    print("testuser does not exist")

print("\nCreating testuser with known password:")
try:
    testuser = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpassword123',
        role='student'
    )
    print(f"Created testuser: {testuser.username}")
except Exception as e:
    print(f"Error creating testuser: {e}")
