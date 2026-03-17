from rest_framework import serializers
from .models import Submission


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = "__all__"
        read_only_fields = ("student", "score", "submitted_at")


class SubmissionWithUserExamSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(
        source="student.username", read_only=True
    )
    student_full_name = serializers.SerializerMethodField()
    exam_title = serializers.CharField(source="exam.title", read_only=True)
    exam_duration = serializers.IntegerField(source="exam.duration", read_only=True)
    exam_class = serializers.SerializerMethodField()
    is_passed = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = (
            "id",
            "exam",
            "exam_title",
            "exam_duration",
            "exam_class",
            "student",
            "student_username",
            "student_full_name",
            "score",
            "submitted_at",
            "is_passed",
        )
    
    def get_student_full_name(self, obj):
        student = obj.student
        return f"{student.first_name} {student.last_name}".strip() or student.username
    
    def get_exam_class(self, obj):
        exam_class = obj.exam.exam_class
        return exam_class.name if exam_class else "Chưa gán lớp"
    
    def get_is_passed(self, obj):
        return obj.score >= 5  # Default passing score


class SubmissionCreateSerializer(serializers.Serializer):
    exam = serializers.IntegerField()
    answers = serializers.DictField(child=serializers.CharField())
