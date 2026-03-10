from rest_framework import generics, permissions, status
from rest_framework.response import Response

from exams.models import Exam, Question
from .models import Submission
from .serializers import (
    SubmissionSerializer,
    SubmissionCreateSerializer,
    SubmissionWithUserExamSerializer,
)


class SubmissionListView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.filter(student=self.request.user).order_by(
            "-submitted_at"
        )


class SubmissionCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubmissionCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exam_id = serializer.validated_data["exam"]
        answers = serializer.validated_data["answers"] or {}

        exam = generics.get_object_or_404(Exam, pk=exam_id)
        questions = Question.objects.filter(exam=exam).only(
            "id", "correct_answer"
        )

        total = questions.count()
        correct = 0

        max_attempts = exam.max_attempts
        if max_attempts is not None:
            existing = Submission.objects.filter(
                exam=exam, student=request.user
            ).count()
            if existing >= max_attempts:
                return Response(
                    {
                        "detail": "Bạn đã hết số lần làm bài cho đề thi này.",
                        "max_attempts": max_attempts,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        for q in questions:
            submitted = answers.get(str(q.id)) or answers.get(q.id)
            if submitted is None:
                continue
            if str(submitted).upper() == str(q.correct_answer).upper():
                correct += 1

        score = round((correct / total) * 10, 2) if total else 0.0

        submission = Submission.objects.create(
            exam=exam,
            student=request.user,
            score=score,
        )

        out = SubmissionSerializer(submission)
        return Response(out.data, status=status.HTTP_201_CREATED)


class ClassSubmissionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubmissionWithUserExamSerializer

    def get_queryset(self):
        class_id = self.kwargs.get("class_id")
        return (
            Submission.objects.select_related("exam", "student")
            .filter(exam__exam_class_id=class_id)
            .order_by("-submitted_at")
        )
