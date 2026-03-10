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
    exam_title = serializers.CharField(source="exam.title", read_only=True)

    class Meta:
        model = Submission
        fields = (
            "id",
            "exam",
            "exam_title",
            "student",
            "student_username",
            "score",
            "submitted_at",
        )


class SubmissionCreateSerializer(serializers.Serializer):
    exam = serializers.IntegerField()
    answers = serializers.DictField(child=serializers.CharField())
