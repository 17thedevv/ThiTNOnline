from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Class


User = get_user_model()


class ClassStudentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "full_name")
    
    def get_full_name(self, obj):
        return f"{obj.last_name} {obj.first_name}".strip() or obj.username


class ClassSerializer(serializers.ModelSerializer):
    students = ClassStudentSerializer(many=True, read_only=True)
    students_count = serializers.SerializerMethodField()
    exams_count = serializers.SerializerMethodField()
    subjects = serializers.SerializerMethodField()
    teacher_name = serializers.CharField(source='teacher.username', read_only=True)
    teacher_full_name = serializers.SerializerMethodField()
    teacher_avatar = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Class
        fields = "__all__"
        read_only_fields = ("teacher", "code", "created_at")

    def get_students_count(self, obj):
        return obj.students.count()
    
    def get_exams_count(self, obj):
        return obj.exams.count()
    
    def get_subjects(self, obj):
        # Import here to avoid circular import
        from subjects.models import Subject
        qs = Subject.objects.filter(class_obj=obj).values('id', 'name')
        return list(qs)
    
    def get_teacher_full_name(self, obj):
        teacher = obj.teacher
        return f"{teacher.last_name} {teacher.first_name}".strip() or teacher.username

    def get_teacher_avatar(self, obj):
        request = self.context.get('request')
        teacher = obj.teacher
        if teacher and teacher.avatar:
            if request:
                return request.build_absolute_uri(teacher.avatar.url)
            return teacher.avatar.url
        return None