from django.urls import path
from .views import (
    ClassListCreateView,
    JoinClassByCodeView,
    LeaveClassView,
    ClassDetailView,
    RemoveStudentFromClassView,
)

urlpatterns = [
    path("", ClassListCreateView.as_view(), name="class-list-create"),
    path("<int:pk>/", ClassDetailView.as_view(), name="class-detail"),
    path("join/", JoinClassByCodeView.as_view(), name="class-join-code"),
    path("<int:class_id>/leave/", LeaveClassView.as_view(), name="class-leave"),
    path(
        "<int:class_id>/remove-student/<int:student_id>/",
        RemoveStudentFromClassView.as_view(),
        name="class-remove-student",
    ),
]