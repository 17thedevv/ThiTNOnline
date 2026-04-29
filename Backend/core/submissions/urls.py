from django.urls import path
from .views import (
    SubmissionListView,
    SubmissionCreateView,
    ClassSubmissionListView,
    ExportClassSubmissionsView,
    SubmissionApproveView,
)

urlpatterns = [
    path("", SubmissionListView.as_view(), name="submission-list"),
    path("submit/", SubmissionCreateView.as_view(), name="submission-create"),
    path(
        "class/<int:class_id>/",
        ClassSubmissionListView.as_view(),
        name="submission-class-list",
    ),
    path(
        "class/<int:class_id>/export/",
        ExportClassSubmissionsView.as_view(),
        name="submission-class-export",
    ),
    path(
        "<int:submission_id>/approve/",
        SubmissionApproveView.as_view(),
        name="submission-approve",
    ),
]


