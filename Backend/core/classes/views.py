from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from .models import Class
from .serializers import ClassSerializer


class ClassListCreateView(generics.ListCreateAPIView):
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", None)

        if role == "teacher":
            return Class.objects.filter(teacher=user)
        if role == "admin":
            return Class.objects.all()
        return Class.objects.filter(students=user)

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class JoinClassByCodeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = str(request.data.get("code", "")).upper()
        cls = get_object_or_404(Class, code=code)
        cls.students.add(request.user)
        return Response(
            {"detail": "Joined class successfully.", "class_id": cls.id},
            status=status.HTTP_200_OK,
        )


class LeaveClassView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, class_id):
        cls = get_object_or_404(Class, pk=class_id)
        cls.students.remove(request.user)
        return Response(
            {"detail": "Left class successfully."},
            status=status.HTTP_200_OK,
        )


class RemoveStudentFromClassView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, class_id, student_id):
        cls = get_object_or_404(Class, pk=class_id)
        user = request.user
        role = getattr(user, "role", None)

        if not (role == "admin" or cls.teacher == user):
            raise PermissionDenied("Chỉ giáo viên hoặc admin mới được xoá học sinh.")

        cls.students.remove(student_id)
        return Response(
            {"detail": "Đã xoá học sinh khỏi lớp."},
            status=status.HTTP_200_OK,
        )


class ClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Class.objects.all()

    def get_object(self):
        cls = get_object_or_404(Class, pk=self.kwargs.get("pk"))
        user = self.request.user
        role = getattr(user, "role", None)

        if role == "admin" or cls.teacher == user or user in cls.students.all():
            return cls

        raise PermissionDenied("Bạn không có quyền truy cập lớp này.")

    def perform_update(self, serializer):
        cls = self.get_object()
        user = self.request.user
        role = getattr(user, "role", None)

        if role == "admin" or cls.teacher == user:
            serializer.save()
        else:
            raise PermissionDenied("Chỉ giáo viên hoặc admin mới được sửa lớp.")

    def perform_destroy(self, instance):
        user = self.request.user
        role = getattr(user, "role", None)

        if role == "admin" or instance.teacher == user:
            instance.delete()
        else:
            raise PermissionDenied("Chỉ giáo viên hoặc admin mới được xoá lớp.")
