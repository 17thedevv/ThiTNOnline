from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth import update_session_auth_hash
from .serializers import RegisterSerializer, UserSerializer, UserUpdateSerializer, UserProfileSerializer

User = get_user_model()


# REGISTER
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# GET CURRENT USER
class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# GET USER PROFILE
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_profile(request):
    """Lấy thông tin hồ sơ người dùng hiện tại"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'full_name': user.full_name,
        'display_name': user.display_name,
        'role': user.role,
        'avatar': user.avatar.url if user.avatar else None,
        'created_at': user.created_at,
        'is_active': user.is_active
    })


# TEST UPDATE PROFILE (no permissions)
@api_view(['PATCH'])
@permission_classes([])
def test_update_profile(request):
    """Test endpoint for profile update"""
    user = User.objects.first()  # Always use first user
    if not user:
        return Response({'error': 'No user found'}, status=400)
    
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'display_name': user.display_name,
            'role': user.role,
            'avatar': user.avatar.url if user.avatar else None,
            'created_at': user.created_at,
            'is_active': user.is_active
        })
    
    return Response(serializer.errors, status=400)


# UPDATE USER PROFILE
@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """Cập nhật thông tin hồ sơ người dùng hiện tại"""
    user = request.user
    serializer = UserUpdateSerializer(user, data=request.data, partial=True, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'display_name': user.display_name,
            'role': user.role,
            'avatar': user.avatar.url if user.avatar else None,
            'created_at': user.created_at,
            'is_active': user.is_active
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# UPLOAD AVATAR
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_avatar(request):
    """Upload avatar cho người dùng"""
    if 'avatar' not in request.FILES:
        return Response(
            {'error': 'No avatar file provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    user.avatar = request.FILES['avatar']
    user.save()
    
    return Response({
        'message': 'Avatar uploaded successfully',
        'avatar_url': user.avatar.url if user.avatar else None
    })


# CHANGE PASSWORD
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Đổi mật khẩu người dùng"""
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not current_password or not new_password or not confirm_password:
        return Response(
            {'error': 'All password fields are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if new_password != confirm_password:
        return Response(
            {'error': 'New passwords do not match'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    if not user.check_password(current_password):
        return Response(
            {'error': 'Current password is incorrect'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    update_session_auth_hash(request, user)  # Keep user logged in
    
    return Response({'message': 'Password changed successfully'})