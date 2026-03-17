from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    path('test/', views.test_chat_with_ai, name='test_chat_with_ai'),
    path('chat/', views.chat_with_ai, name='chat_with_ai'),
]
