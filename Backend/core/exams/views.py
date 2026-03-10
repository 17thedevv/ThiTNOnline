from rest_framework import generics, permissions
from .models import Exam, Question
from .serializers import ExamSerializer, QuestionSerializer


class ExamListCreateView(generics.ListCreateAPIView):
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Exam.objects.all()
        class_id = self.request.query_params.get("class_id")
        if class_id:
            queryset = queryset.filter(exam_class_id=class_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExamDetailView(generics.RetrieveAPIView):
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Exam.objects.all()


class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(exam_id=self.kwargs["exam_id"])

    def perform_create(self, serializer):
        serializer.save(exam_id=self.kwargs["exam_id"])
