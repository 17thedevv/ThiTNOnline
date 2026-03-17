from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Exam, Question
from .serializers import ExamSerializer, QuestionSerializer, ExamDetailSerializer


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
    serializer_class = ExamDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        exam_id = self.kwargs.get('exam_id')
        if exam_id:
            return Exam.objects.get(id=exam_id)
        return None


class ExamUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ExamDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        exam_id = self.kwargs.get('exam_id')
        if exam_id:
            obj = Exam.objects.get(id=exam_id)
            # Check if user owns this exam
            if obj.created_by != self.request.user and not self.request.user.is_staff:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Bạn không có quyền chỉnh sửa bài thi này")
            return obj
        return None

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Handle both full update and info-only update
        if 'questions' not in request.data:
            # Only updating basic info (title, duration, max_attempts)
            return super().update(request, *args, **kwargs)
        
        # Full update with questions - not implemented yet
        return Response({
            'message': 'Cập nhật thông tin cơ bản thành công!',
            'data': super().update(request, *args, **kwargs).data
        })


class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Question.objects.filter(exam_id=self.kwargs["exam_id"])

    def perform_create(self, serializer):
        serializer.save(exam_id=self.kwargs["exam_id"])
