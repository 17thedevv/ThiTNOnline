from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Conversation, Message, ChatbotResponse
from .serializers import (
    ConversationSerializer, MessageSerializer, 
    ChatbotResponseSerializer, ChatRequestSerializer, ChatResponseSerializer
)
from .service import chatbot_service


class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Gửi tin nhắn đến chatbot và nhận response"""
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        message = serializer.validated_data['message']
        conversation_id = serializer.validated_data.get('conversation_id')
        context = serializer.validated_data.get('context', {})

        # Xử lý tin nhắn
        response = chatbot_service.process_message(
            user=request.user,
            message=message,
            conversation_id=conversation_id,
            context=context
        )

        response_serializer = ChatResponseSerializer(response)
        return Response(response_serializer.data)


class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Lấy danh sách cuộc trò chuyện của user"""
        conversations = Conversation.objects.filter(user=request.user, is_active=True)
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Tạo cuộc trò chuyện mới"""
        title = request.data.get('title', f"Hỗ trợ - {request.data.get('current_page', 'Unknown')}")
        context = request.data.get('context', {})
        
        conversation = Conversation.objects.create(
            user=request.user,
            title=title,
            current_page=context.get('current_page'),
            current_exam_id=context.get('current_exam'),
            current_subject_id=context.get('current_subject')
        )
        
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        """Lấy chi tiết một cuộc trò chuyện"""
        conversation = get_object_or_404(
            Conversation, 
            id=conversation_id, 
            user=request.user
        )
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)

    def put(self, request, conversation_id):
        """Cập nhật thông tin cuộc trò chuyện"""
        conversation = get_object_or_404(
            Conversation, 
            id=conversation_id, 
            user=request.user
        )
        
        # Update context
        if 'current_page' in request.data:
            conversation.current_page = request.data['current_page']
        if 'current_exam' in request.data:
            conversation.current_exam_id = request.data['current_exam']
        if 'current_subject' in request.data:
            conversation.current_subject_id = request.data['current_subject']
        if 'title' in request.data:
            conversation.title = request.data['title']
            
        conversation.save()
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)

    def delete(self, request, conversation_id):
        """Xóa cuộc trò chuyện"""
        conversation = get_object_or_404(
            Conversation, 
            id=conversation_id, 
            user=request.user
        )
        conversation.is_active = False
        conversation.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        """Lấy danh sách tin nhắn của cuộc trò chuyện"""
        conversation = get_object_or_404(
            Conversation, 
            id=conversation_id, 
            user=request.user
        )
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_quick_reply(request):
    """Tạo quick reply cho user"""
    message = request.data.get('message', '')
    conversation_id = request.data.get('conversation_id')
    
    # Xử lý như tin nhắn thường
    response = chatbot_service.process_message(
        user=request.user,
        message=message,
        conversation_id=conversation_id
    )
    
    response_serializer = ChatResponseSerializer(response)
    return Response(response_serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chatbot_stats(request):
    """Lấy thống kê chatbot (cho admin/teacher)"""
    if not request.user.is_staff and request.user.role != 'teacher':
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    total_conversations = Conversation.objects.filter(is_active=True).count()
    total_messages = Message.objects.count()
    
    return Response({
        'total_conversations': total_conversations,
        'total_messages': total_messages,
        'active_users': Conversation.objects.values('user').distinct().count()
    })


class ChatbotResponseManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Lấy danh sách responses (cho admin)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        responses = ChatbotResponse.objects.all()
        serializer = ChatbotResponseSerializer(responses, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Tạo response mới (cho admin)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ChatbotResponseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            # Reload responses in service
            chatbot_service.load_responses()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
