from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """
    Cuộc trò chuyện giữa user và chatbot
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations'
    )
    title = models.CharField(max_length=255, blank=True, null=True)
    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Context information
    current_page = models.CharField(max_length=255, blank=True, null=True)
    current_exam = models.ForeignKey(
        'exams.Exam',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations'
    )
    current_subject = models.ForeignKey(
        'subjects.Subject',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations'
    )

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"Conversation with {self.user.username} - {self.started_at.strftime('%Y-%m-%d %H:%M')}"


class Message(models.Model):
    """
    Tin nhắn trong cuộc trò chuyện
    """
    SENDER_CHOICES = (
        ('user', 'User'),
        ('bot', 'Bot'),
    )

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender_type = models.CharField(
        max_length=10,
        choices=SENDER_CHOICES
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Metadata cho bot response
    response_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Loại response: rule_based, ai_generated, quick_reply"
    )
    confidence_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Độ tin cậy của AI response (0-1)"
    )

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender_type}: {self.content[:50]}..."


class ChatbotResponse(models.Model):
    """
    Các câu trả lời mẫu cho chatbot (rule-based)
    """
    CATEGORY_CHOICES = (
        ('greeting', 'Chào hỏi'),
        ('help', 'Trợ giúp'),
        ('exam', 'Bài thi'),
        ('study', 'Học tập'),
        ('technical', 'Kỹ thuật'),
        ('account', 'Tài khoản'),
        ('other', 'Khác'),
    )

    pattern = models.CharField(
        max_length=500,
        help_text="Regex pattern để match câu hỏi của user"
    )
    response = models.TextField(
        help_text="Câu trả lời của bot"
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='other'
    )
    priority = models.IntegerField(
        default=0,
        help_text="Độ ưu tiên, số càng cao càng ưu tiên"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Quick replies options
    quick_replies = models.JSONField(
        default=list,
        blank=True,
        help_text="List of quick reply buttons"
    )

    class Meta:
        ordering = ['-priority', 'created_at']

    def __str__(self):
        return f"{self.category}: {self.pattern[:30]}..."


class ChatbotAnalytics(models.Model):
    """
    Analytics cho chatbot performance
    """
    date = models.DateField(auto_now_add=True)
    total_conversations = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    user_satisfaction_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Điểm hài lòng của user (1-5)"
    )
    most_asked_questions = models.JSONField(
        default=list,
        blank=True,
        help_text="Top 10 câu hỏi được hỏi nhiều nhất"
    )

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Analytics for {self.date}"
