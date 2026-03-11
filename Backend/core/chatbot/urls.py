from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    # Chat endpoints
    path('chat/', views.ChatView.as_view(), name='chat'),
    path('quick-reply/', views.create_quick_reply, name='quick-reply'),
    
    # Conversation endpoints
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    
    # Admin endpoints
    path('stats/', views.chatbot_stats, name='stats'),
    path('responses/', views.ChatbotResponseManageView.as_view(), name='response-manage'),
]
