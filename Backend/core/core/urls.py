from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "Backend is running "})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),
    path('api/auth/', include('users.urls')),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/subjects/', include('subjects.urls')),
    path('api/exams/', include('exams.urls')),
    path('api/classes/', include('classes.urls')),
    path('api/submissions/', include('submissions.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/chatbot/', include('chatbot.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)