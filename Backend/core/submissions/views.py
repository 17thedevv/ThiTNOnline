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
        
        # Debug: Print answers to see what we're receiving
        print(f"DEBUG: Received answers: {answers}")
        print(f"DEBUG: Answers type: {type(answers)}")
        print(f"DEBUG: Answers keys: {list(answers.keys())}")

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

        # Debug: Print questions to see what we're comparing against
        print(f"DEBUG: Questions count: {total}")
        for q in questions:
            submitted = answers.get(str(q.id)) or answers.get(q.id)
            print(f"DEBUG: Question {q.id}, correct_answer: {q.correct_answer}, submitted: {submitted}, submitted_type: {type(submitted)}")
            if submitted is None:
                continue
            if str(submitted).upper() == str(q.correct_answer).upper():
                correct += 1
                print(f"DEBUG: CORRECT! Total correct: {correct}")
            else:
                print(f"DEBUG: WRONG! Expected: {q.correct_answer}, Got: {submitted}")

        print(f"DEBUG: Final correct count: {correct}/{total}")

        score = round((correct / total) * 10, 2) if total else 0.0

        submission = Submission.objects.create(
            exam=exam,
            student=request.user,
            score=score,
        )

        # Add correct count and total to response
        out = SubmissionSerializer(submission)
        response_data = out.data
        response_data['correct_count'] = correct
        response_data['total_questions'] = total
        response_data['percentage'] = round((correct / total) * 100, 1) if total else 0
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class ClassSubmissionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubmissionWithUserExamSerializer

    def get_queryset(self):
        try:
            class_id = self.kwargs.get("class_id")
            return (
                Submission.objects.select_related("exam", "student")
                .filter(exam__exam_class_id=class_id)
                .exclude(exam__exam_class__isnull=True)
                .order_by("-submitted_at")
            )
        except Exception as e:
            print(f"Error in ClassSubmissionListView: {e}")
            return Submission.objects.none()
