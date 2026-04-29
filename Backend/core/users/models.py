from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )

    # Basic auth fields (inherited from AbstractUser)
    # username - Tên tài khoản đăng nhập (unique)
    # email - Email (unique if required)
    # password - Mật khẩu
    
    # Profile fields
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )
    
    # Tên thật của người dùng (tách biệt với username)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    
    # Thông tin bổ sung
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    @property
    def full_name(self):
        """Return the full name of the user."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def display_name(self):
        """Return the display name (full name or username)."""
        return self.full_name or self.username
    
    def __str__(self):
        return f"{self.display_name} ({self.username})"

class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        # Mặc định code có hiệu lực trong 10 phút (600 giây)
        return not self.is_used and (timezone.now() - self.created_at).total_seconds() < 600

    def __str__(self):
        return f"Reset code for {self.user.username} - {self.code}"