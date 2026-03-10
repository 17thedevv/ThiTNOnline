from rest_framework import generics, permissions
from .models import Exam, Question
from .serializers import ExamSerializer, QuestionSerializer

class ExamListCreateView(generics.ListCreateAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(exam_id=self.kwargs['exam_id'])

    def perform_create(self, serializer):
        serializer.save(exam_id=self.kwargs['exam_id'])
