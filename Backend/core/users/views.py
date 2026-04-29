from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth import update_session_auth_hash
from django.db.models import Q
from .serializers import RegisterSerializer, UserSerializer, UserUpdateSerializer, UserProfileSerializer, AdminUserSerializer
from django.core.mail import send_mail
from .models import PasswordResetCode
import random

User = get_user_model()


class IsAdminRole(permissions.BasePermission):
    """Chỉ admin mới được truy cập"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', '') == 'admin'
        )


class IsTeacherOrAdmin(permissions.BasePermission):
    """Teacher hoặc Admin mới được tạo/sửa"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', '') in ['admin', 'teacher']
        )


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

# FORGOT PASSWORD
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """Yêu cầu mã xác nhận qua email để đặt lại mật khẩu dựa trên username"""
    username = request.data.get('username')
    if not username:
        return Response({'error': 'Vui lòng nhập tên đăng nhập'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        # To prevent account enumeration, return a generic success message
        return Response({'message': 'System will process your request'})

    email = user.email
    if not email:
        return Response({'error': 'Tài khoản này chưa được liên kết với email nào.'}, status=status.HTTP_400_BAD_REQUEST)

    # Generate 6-digit code
    code = str(random.randint(100000, 999999))
    
    # Save code to DB
    PasswordResetCode.objects.create(user=user, code=code)

    # Send email
    subject = 'Mã đặt lại mật khẩu của bạn - Thi Trắc Nghiệm Online'
    message = f'Xin chào {user.display_name},\n\nMã xác nhận đặt lại mật khẩu của bạn là: {code}\nMã này có hiệu lực trong 10 phút.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, xin hãy bỏ qua email này.'
    
    try:
        send_mail(subject, message, None, [email], fail_silently=False)
    except Exception as e:
        return Response({'error': f'Lỗi gửi email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Mask email for UI: e.g. a***@gmail.com
    masked_email = email[0] + '***' + email[email.find('@'):] if '@' in email else '***'
    
    return Response({
        'message': f'Mã xác nhận đã được gửi đến email {masked_email}'
    })

# RESET PASSWORD
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Đặt lại mật khẩu với mã xác nhận"""
    username = request.data.get('username')
    code = request.data.get('code')
    new_password = request.data.get('new_password')

    if len(new_password or '') < 8:
        return Response({'error': 'Mật khẩu phải có ít nhất 8 ký tự'}, status=status.HTTP_400_BAD_REQUEST)

    if not all([username, code, new_password]):
        return Response({'error': 'Thiếu thông tin bắt buộc (tên đăng nhập, mã xác nhận, mật khẩu mới)'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'Tên đăng nhập hoặc mã xác nhận không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    # Find the valid code
    reset_code = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).order_by('-created_at').first()

    if not reset_code or not reset_code.is_valid():
        return Response({'error': 'Mã xác nhận không hợp lệ hoặc đã hết hạn'}, status=status.HTTP_400_BAD_REQUEST)

    # Update password
    user.set_password(new_password)
    user.save()

    # Mark code as used
    reset_code.is_used = True
    reset_code.save()

    return Response({'message': 'Mật khẩu đã được đặt lại thành công'})


# ============================================================
# ADMIN: QUẢN LÝ NGƯỜI DÙNG
# ============================================================

class UserListCreateView(generics.ListCreateAPIView):
    """Admin: Lấy danh sách và tạo mới người dùng"""
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            from .serializers import RegisterSerializer
            return RegisterSerializer
        return AdminUserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        if role:
            queryset = queryset.filter(role=role)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        return queryset.distinct()


class UserDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Xem, cập nhật, xóa người dùng theo ID"""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.all()
    lookup_field = 'pk'

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response(
                {'error': 'Không thể xóa tài khoản đang đăng nhập.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Xóa các dữ liệu mồ côi (ví dụ: bảng chatbot_conversation, chatbot_message không còn trong model)
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM chatbot_message WHERE conversation_id IN (SELECT id FROM chatbot_conversation WHERE user_id = %s)", [user.id])
                cursor.execute("DELETE FROM chatbot_conversation WHERE user_id = %s", [user.id])
        except Exception:
            pass

        try:
            user.delete()
            return Response({'message': 'Đã xóa người dùng thành công.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Không thể xóa người dùng này do có dữ liệu liên quan. Chi tiết: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )