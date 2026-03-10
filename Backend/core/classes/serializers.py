from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Class


User = get_user_model()


class ClassStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role")


class ClassSerializer(serializers.ModelSerializer):
    students = ClassStudentSerializer(many=True, read_only=True)
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = "__all__"
        read_only_fields = ("teacher", "code")

    def get_students_count(self, obj):
        return obj.students.count()