from django.urls import path
from .views import ExamListCreateView, QuestionListCreateView

urlpatterns = [
    path('', ExamListCreateView.as_view(), name='exam-list-create'),
    path('<int:exam_id>/questions/', QuestionListCreateView.as_view(), name='question-list-create'),
]
