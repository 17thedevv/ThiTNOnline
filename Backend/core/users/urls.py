from django.urls import path
from .views import (
    RegisterView, MeView, get_profile, update_profile, 
    upload_avatar, change_password, test_update_profile,
    forgot_password, reset_password,
    UserListCreateView, UserDetailAdminView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('me/', MeView.as_view()),
    path('profile/', get_profile),
    path('profile/update/', update_profile),
    path('profile/test-update/', test_update_profile),
    path('profile/upload-avatar/', upload_avatar),
    path('profile/change-password/', change_password),
    path('forgot-password/', forgot_password),
    path('reset-password/', reset_password),
    # Admin: Quản lý người dùng
    path('users/', UserListCreateView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', UserDetailAdminView.as_view(), name='admin-user-detail'),
]