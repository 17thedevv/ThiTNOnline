import csv
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse

from exams.models import Exam, Question
from .models import Submission
from .serializers import (
    SubmissionSerializer,
    SubmissionCreateSerializer,
    SubmissionWithUserExamSerializer,
    SubmissionApproveSerializer,
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
        
        # Kiểm tra hạn nộp bài
        from django.utils import timezone
        if exam.due_date and timezone.now() > exam.due_date:
            return Response(
                {
                    "detail": "Bài thi này đã quá hạn nộp.",
                    "due_date": exam.due_date,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

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
        response_data = out.data
        response_data['correct_count'] = correct
        response_data['total_questions'] = total
        response_data['percentage'] = round((correct / total) * 100, 1) if total else 0
        
        return Response(response_data, status=status.HTTP_201_CREATED)


class ClassSubmissionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubmissionWithUserExamSerializer

    def get_queryset(self):
        class_id = self.kwargs.get("class_id")
        return (
            Submission.objects.select_related("exam", "student", "exam__subject")
            .filter(
                Q(exam__exam_class_id=class_id) |
                Q(exam__subject__class_obj_id=class_id)
            )
            .order_by("-submitted_at")
            .distinct()
        )


class ExportClassSubmissionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, class_id):
        # 1. Check if user is teacher of the class or admin
        from classes.models import Class
        class_obj = generics.get_object_or_404(Class, id=class_id)
        
        # Security check: only teacher of this class or staff can export
        if class_obj.teacher != request.user and not request.user.is_staff:
            return Response(
                {"detail": "Bạn không có quyền xuất dữ liệu của lớp này."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Get submissions (hỗ trợ cả exam cũ và exam qua subject mới)
        submissions = (
            Submission.objects.select_related("exam", "student")
            .filter(
                Q(exam__exam_class_id=class_id) |
                Q(exam__subject__class_obj_id=class_id)
            )
            .order_by("-submitted_at")
            .distinct()
        )

        # 3. Create CSV response
        response = HttpResponse(content_type='text/csv')
        # Use filename with class name
        filename = f"BangDiem_{class_obj.name.replace(' ', '_')}.csv"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        # Write UTF-8 BOM for Excel compatibility
        response.write(u'\ufeff'.encode('utf8'))
        
        writer = csv.writer(response)
        writer.writerow(['Học sinh', 'Tên đăng nhập', 'Email', 'Bài thi', 'Điểm', 'Thời gian nộp'])

        for sub in submissions:
            writer.writerow([
                sub.student.full_name or sub.student.username,
                sub.student.username,
                sub.student.email,
                sub.exam.title,
                sub.score,
                sub.submitted_at.strftime('%d/%m/%Y %H:%M:%S') if sub.submitted_at else ''
            ])

        return response


class SubmissionApproveView(APIView):
    """Teacher/Admin phê duyệt hoặc điều chỉnh điểm thủ công"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({'error': 'Không tìm thấy bài nộp.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        role = getattr(user, 'role', '')

        # Check permission: must be admin, or teacher of the exam's class
        if role == 'admin':
            pass
        elif role == 'teacher':
            from classes.models import Class
            # Hỗ trợ cả exam_class cũ và subject.class_obj mới
            exam = submission.exam
            exam_class = exam.exam_class
            subject_class = exam.subject.class_obj if exam.subject else None
            teacher_class = exam_class or subject_class
            if not teacher_class or teacher_class.teacher != user:
                return Response(
                    {'error': 'Bạn không có quyền phê duyệt bài nộp này.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Chỉ giảng viên hoặc quản trị viên mới có quyền phê duyệt.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = SubmissionApproveSerializer(submission, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Cập nhật kết quả thành công.',
                'submission': SubmissionSerializer(submission).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({'error': 'Không tìm thấy bài nộp.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        role = getattr(user, 'role', '')

        # Check permission: must be admin, or teacher of the exam's class
        if role == 'admin':
            pass
        elif role == 'teacher':
            exam = submission.exam
            exam_class = exam.exam_class
            subject_class = exam.subject.class_obj if exam.subject else None
            teacher_class = exam_class or subject_class
            if not teacher_class or teacher_class.teacher != user:
                return Response(
                    {'error': 'Bạn không có quyền xóa bài nộp này.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Chỉ giảng viên hoặc quản trị viên được xóa.'},
                status=status.HTTP_403_FORBIDDEN
            )

        submission.delete()
        return Response({'message': 'Đã xóa bài nộp.'}, status=status.HTTP_200_OK)
