from rest_framework import serializers
from .models import Exam, Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class ExamSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()
    class_name = serializers.CharField(source='exam_class.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')
    
    def get_question_count(self, obj):
        return obj.questions.count()


class ExamDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class_name = serializers.CharField(source='exam_class.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')
