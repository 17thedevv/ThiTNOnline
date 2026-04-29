from rest_framework import generics, permissions
from .models import Subject
from .serializers import SubjectSerializer
from users.views import IsTeacherOrAdmin


class SubjectListCreateView(generics.ListCreateAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        class_id = self.request.query_params.get('class_id')

        if getattr(user, 'role', '') == 'admin':
            queryset = Subject.objects.all().order_by('name')
        else:
            # Teacher chỉ thấy môn của các lớp mình phụ trách
            queryset = Subject.objects.filter(class_obj__teacher=user).order_by('name')

        if class_id:
            queryset = queryset.filter(class_obj_id=class_id)
        return queryset


class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE môn học theo ID — chỉ admin/teacher mới sửa/xóa"""
    serializer_class = SubjectSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        return Subject.objects.all()
