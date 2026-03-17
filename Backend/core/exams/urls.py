from django.urls import path
from .views import ExamListCreateView, QuestionListCreateView, ExamDetailView, ExamUpdateView

urlpatterns = [
    path("", ExamListCreateView.as_view(), name="exam-list-create"),
    path("<int:exam_id>/", ExamDetailView.as_view(), name="exam-detail"),
    path("<int:exam_id>/edit/", ExamUpdateView.as_view(), name="exam-update"),
    path(
        "<int:exam_id>/questions/",
        QuestionListCreateView.as_view(),
        name="question-list-create",
    ),
]
