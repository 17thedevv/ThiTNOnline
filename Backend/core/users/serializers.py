from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'student'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer cho User model với đầy đủ thông tin hồ sơ"""
    full_name = serializers.ReadOnlyField()
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name', 
            'display_name', 'role', 'phone', 'address', 'date_of_birth', 
            'avatar', 'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'username', 'created_at', 'updated_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer cho cập nhật thông tin người dùng"""
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer cho xem hồ sơ người dùng (read-only)"""
    full_name = serializers.ReadOnlyField()
    display_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'display_name', 'role', 'phone', 'address', 'date_of_birth', 
            'avatar', 'created_at'
        ]
        read_only_fields = fields


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer cho Admin quản lý người dùng (full CRUD)"""
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'address', 'date_of_birth',
            'avatar', 'created_at', 'is_active'
        ]
        read_only_fields = ['id', 'username', 'created_at']