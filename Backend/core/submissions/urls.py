from django.urls import path
from .views import (
    SubmissionListView,
    SubmissionCreateView,
    ClassSubmissionListView,
)


urlpatterns = [
    path("", SubmissionListView.as_view(), name="submission-list"),
    path("submit/", SubmissionCreateView.as_view(), name="submission-create"),
    path(
        "class/<int:class_id>/",
        ClassSubmissionListView.as_view(),
        name="submission-class-list",
    ),
]

