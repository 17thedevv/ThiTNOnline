from django.urls import path
from .views import RegisterView, MeView, get_profile, update_profile, upload_avatar, change_password, test_update_profile

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('me/', MeView.as_view()),
    path('profile/', get_profile),
    path('profile/update/', update_profile),
    path('profile/test-update/', test_update_profile),
    path('profile/upload-avatar/', upload_avatar),
    path('profile/change-password/', change_password),
    # User management endpoints (for admin/teacher)
    path('users/', MeView.as_view()),  # Temporary - will be updated later
]