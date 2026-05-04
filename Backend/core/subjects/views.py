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

        role = getattr(user, 'role', '')

        if role == 'admin':
            queryset = Subject.objects.all().order_by('name')
        elif role == 'teacher':
            # Teacher thấy môn của các lớp mình phụ trách (hoặc môn của lớp bất kỳ nếu query theo class_id và teacher đang truy cập, mặc dù get_queryset sẽ tự query, nhưng để an toàn cứ cho lấy theo class_id nếu có)
            queryset = Subject.objects.filter(class_obj__teacher=user).order_by('name')
        else:
            # Student
            queryset = Subject.objects.filter(class_obj__students=user).order_by('name')

        if class_id:
            # Nếu có class_id, ta bỏ qua filter ban đầu và lấy các môn của class đó, TÙY THEO quyền
            if role == 'admin':
                queryset = Subject.objects.filter(class_obj_id=class_id).order_by('name')
            elif role == 'teacher':
                queryset = Subject.objects.filter(class_obj_id=class_id).order_by('name')
            else:
                queryset = Subject.objects.filter(class_obj_id=class_id, class_obj__students=user).order_by('name')
                
        return queryset.distinct()


class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE môn học theo ID — chỉ admin/teacher mới sửa/xóa"""
    serializer_class = SubjectSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        return Subject.objects.all()
