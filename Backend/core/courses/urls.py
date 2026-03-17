from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CourseViewSet, 
    LessonViewSet, 
    CourseEnrollmentViewSet,
    MyCoursesView,
    FeaturedCoursesView
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'enrollments', CourseEnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('my-courses/', MyCoursesView.as_view(), name='my-courses'),
    path('featured/', FeaturedCoursesView.as_view(), name='featured-courses'),
]
