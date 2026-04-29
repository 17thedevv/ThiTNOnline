from rest_framework import serializers
from .models import Exam, Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class ExamSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_name = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_class_name(self, obj):
        if obj.subject and obj.subject.class_obj:
            return obj.subject.class_obj.name
        if obj.exam_class:
            return obj.exam_class.name
        return None


class ExamDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_name = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

    def get_class_name(self, obj):
        if obj.subject and obj.subject.class_obj:
            return obj.subject.class_obj.name
        if obj.exam_class:
            return obj.exam_class.name
        return None
