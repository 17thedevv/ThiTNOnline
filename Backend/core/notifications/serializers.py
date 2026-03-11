from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    is_new = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 
            'is_read', 'created_at', 'time_ago', 'is_new',
            'exam', 'class_obj'
        ]
        read_only_fields = ['created_at']

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Vừa xong"
        elif diff < timedelta(hours=1):
            return f"{diff.seconds // 60} phút trước"
        elif diff < timedelta(days=1):
            return f"{diff.seconds // 3600} giờ trước"
        elif diff < timedelta(days=7):
            return f"{diff.days} ngày trước"
        else:
            return obj.created_at.strftime("%d/%m/%Y")

    def get_is_new(self, obj):
        return not obj.is_read
