from django.urls import path
from .views import (
    ExamListCreateView, QuestionListCreateView, ExamDetailView, 
    ExamUpdateView, GeneralStatisticsView, ExamStatisticsView,
    BankQuestionListCreateView, BankQuestionDetailView, QuestionDetailView
)

urlpatterns = [
    path("statistics/general/", GeneralStatisticsView.as_view(), name="general-statistics"),
    path("statistics/<int:exam_id>/", ExamStatisticsView.as_view(), name="exam-statistics"),
    path("questions/bank/", BankQuestionListCreateView.as_view(), name="bank-question-list"),
    path("questions/bank/<int:pk>/", BankQuestionDetailView.as_view(), name="bank-question-detail"),
    path("", ExamListCreateView.as_view(), name="exam-list-create"),
    path("<int:exam_id>/", ExamDetailView.as_view(), name="exam-detail"),
    path("<int:exam_id>/edit/", ExamUpdateView.as_view(), name="exam-update"),
    path("<int:exam_id>/questions/", QuestionListCreateView.as_view(), name="question-list-create"),
    path("<int:exam_id>/questions/<int:pk>/", QuestionDetailView.as_view(), name="question-detail"),
]

