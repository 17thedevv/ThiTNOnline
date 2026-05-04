from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Avg, Max, Min
from .models import Exam, Question
from users.models import User
from users.views import IsTeacherOrAdmin
from submissions.models import Submission
from classes.models import Class
from subjects.models import Subject
from .serializers import ExamSerializer, QuestionSerializer, ExamDetailSerializer


class ExamListCreateView(generics.ListCreateAPIView):
    serializer_class = ExamSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        queryset = Exam.objects.all()
        subject_id = self.request.query_params.get("subject_id")
        class_id = self.request.query_params.get("class_id")
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        elif class_id:
            # Tương thích ngược: lọc qua subject.class_obj hoặc exam_class cũ
            queryset = queryset.filter(subject__class_obj_id=class_id) | queryset.filter(exam_class_id=class_id)
        return queryset.distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ExamDetailView(generics.RetrieveAPIView):
    serializer_class = ExamDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        exam_id = self.kwargs.get('exam_id')
        if exam_id:
            return Exam.objects.get(id=exam_id)
        return None


class ExamUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExamDetailSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_object(self):
        exam_id = self.kwargs.get('exam_id')
        if exam_id:
            obj = Exam.objects.get(id=exam_id)
            if obj.created_by != self.request.user and not self.request.user.is_staff:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Bạn không có quyền chỉnh sửa bài thi này")
            return obj
        return None

    def update(self, request, *args, **kwargs):
        # Hỗ trợ PATCH (partial=True) để chỉ update một số field metadata
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Question.objects.filter(exam_id=self.kwargs["exam_id"])

    def perform_create(self, serializer):
        serializer.save(exam_id=self.kwargs["exam_id"])


class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH/PUT/DELETE từng câu hỏi của một bài thi"""
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Question.objects.filter(exam_id=self.kwargs["exam_id"])

    def get_object(self):
        queryset = self.get_queryset()
        obj = generics.get_object_or_404(queryset, pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj


class BankQuestionListCreateView(generics.ListCreateAPIView):
    """Quản lý câu hỏi trong ngân hàng chung (exam is null)"""
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = Question.objects.filter(exam__isnull=True).order_by('-id')
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(question_text__icontains=search)
        return queryset


class BankQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Chi tiết/Sửa/Xóa câu hỏi trong ngân hàng chung"""
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Question.objects.filter(exam__isnull=True)


class GeneralStatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, 'role', '')

        if role == 'student':
            # Lấy bài thi qua subject.class_obj hoặc exam_class cũ
            total_exams = Exam.objects.filter(
                subject__class_obj__students=user
            ).count() + Exam.objects.filter(exam_class__students=user, subject__isnull=True).count()
            submissions = Submission.objects.filter(student=user)
            total_submissions = submissions.count()
            avg_score = submissions.aggregate(Avg('score'))['score__avg'] or 0

            return Response({
                "student_view": True,
                "total_exams_in_class": total_exams,
                "total_submissions": total_submissions,
                "average_score": round(avg_score, 2)
            })

        if role == 'teacher':
            teacher_classes = Class.objects.filter(teacher=user)
            total_classes = teacher_classes.count()
            total_students_val = User.objects.filter(joined_classes__in=teacher_classes).distinct().count()

            # Bài thi qua subject mới + bài thi cũ qua exam_class
            teacher_exams = Exam.objects.filter(
                subject__class_obj__in=teacher_classes
            ) | Exam.objects.filter(exam_class__in=teacher_classes, subject__isnull=True)
            teacher_exams = teacher_exams.distinct()
            total_exams = teacher_exams.count()

            teacher_submissions = Submission.objects.filter(exam__in=teacher_exams)
            total_submissions = teacher_submissions.count()
            avg_score = teacher_submissions.aggregate(Avg('score'))['score__avg'] or 0

            return Response({
                "teacher_view": True,
                "total_classes": total_classes,
                "total_students": total_students_val,
                "total_exams": total_exams,
                "total_submissions": total_submissions,
                "average_score": round(avg_score, 2)
            })

        if role == 'admin':
            total_students = User.objects.filter(role='student').count()
            total_teachers = User.objects.filter(role='teacher').count()
            total_exams = Exam.objects.count()

            submissions = Submission.objects.all()
            total_submissions = submissions.count()
            avg_score = submissions.aggregate(Avg('score'))['score__avg'] or 0

            return Response({
                "admin_view": True,
                "total_students": total_students,
                "total_teachers": total_teachers,
                "total_exams": total_exams,
                "total_submissions": total_submissions,
                "average_score": round(avg_score, 2)
            })

        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Bạn không có quyền truy cập thống kê")


class ExamStatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, exam_id):
        try:
            exam = Exam.objects.get(id=exam_id)
        except Exam.DoesNotExist:
            return Response({"error": "Không tìm thấy bài thi"}, status=404)

        user = request.user
        role = getattr(user, 'role', '')

        # Lấy lớp học qua subject mới hoặc exam_class cũ
        exam_class = None
        if exam.subject and exam.subject.class_obj:
            exam_class = exam.subject.class_obj
        elif exam.exam_class:
            exam_class = exam.exam_class

        if role not in ['admin', 'teacher']:
            if not exam_class or not exam_class.students.filter(id=user.id).exists():
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Bạn không thuộc lớp học này để xem thống kê")

        submissions = Submission.objects.filter(exam=exam)
        total_participants = submissions.values('student').distinct().count()
        total_submissions = submissions.count()

        stats = submissions.aggregate(
            avg_score=Avg('score'),
            max_score=Max('score'),
            min_score=Min('score')
        )

        dist = {"0 - 4": 0, "4 - 6": 0, "6 - 8": 0, "8 - 10": 0}
        participant_submissions = []
        for student_dict in submissions.values('student').distinct():
            student_obj = User.objects.get(id=student_dict['student'])
            best_sub = submissions.filter(student=student_obj).order_by('-score').first()
            if best_sub:
                participant_submissions.append(best_sub)

        for sub in participant_submissions:
            score = sub.score
            if score < 4:
                dist["0 - 4"] += 1
            elif score < 6:
                dist["4 - 6"] += 1
            elif score < 8:
                dist["6 - 8"] += 1
            else:
                dist["8 - 10"] += 1

        score_distribution = [{"name": k, "count": v} for k, v in dist.items()]

        student_results = []
        if exam_class:
            class_students = exam_class.students.all()
            for student in class_students:
                student_subs = submissions.filter(student=student)
                if student_subs.exists():
                    best_sub = student_subs.order_by('-score').first()
                    student_results.append({
                        "id": student.id,
                        "name": student.full_name or student.username,
                        "status": "Đã nộp",
                        "score": round(best_sub.score, 2),
                        "submitted_at": best_sub.submitted_at
                    })
                else:
                    student_results.append({
                        "id": student.id,
                        "name": student.full_name or student.username,
                        "status": "Chưa nộp",
                        "score": None,
                        "submitted_at": None
                    })
        else:
            for sub in participant_submissions:
                student = sub.student
                student_results.append({
                    "id": student.id,
                    "name": student.full_name or student.username,
                    "status": "Đã nộp",
                    "score": round(sub.score, 2),
                    "submitted_at": sub.submitted_at
                })

        return Response({
            "exam_title": exam.title,
            "subject_name": exam.subject.name if exam.subject else None,
            "class_name": exam_class.name if exam_class else None,
            "total_participants": total_participants,
            "total_submissions": total_submissions,
            "average_score": round(stats['avg_score'] or 0, 2),
            "highest_score": stats['max_score'] or 0,
            "lowest_score": stats['min_score'] or 0,
            "score_distribution": score_distribution,
            "student_results": student_results
        })
