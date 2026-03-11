from rest_framework import serializers
from .models import Conversation, Message, ChatbotResponse


class MessageSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'sender_type', 'content', 'created_at', 'time_ago',
            'response_type', 'confidence_score'
        ]

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "vừa xong"
        elif diff < timedelta(hours=1):
            return f"{diff.seconds // 60} phút trước"
        elif diff < timedelta(days=1):
            return f"{diff.seconds // 3600} giờ trước"
        else:
            return obj.created_at.strftime("%H:%M %d/%m/%Y")


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'title', 'started_at', 'updated_at', 'is_active',
            'current_page', 'current_exam', 'current_subject',
            'messages', 'last_message', 'message_count'
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatbotResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatbotResponse
        fields = [
            'id', 'pattern', 'response', 'category', 'priority',
            'is_active', 'quick_replies'
        ]


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000)
    conversation_id = serializers.IntegerField(required=False)
    context = serializers.DictField(required=False)


class ChatResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    conversation_id = serializers.IntegerField()
    response_type = serializers.CharField()
    confidence_score = serializers.FloatField(required=False)
    quick_replies = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
