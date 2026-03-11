import re
import json
from django.utils import timezone
from .models import Conversation, Message, ChatbotResponse
from .ai_service import ai_service


class ChatbotService:
    def __init__(self):
        self.load_responses()

    def load_responses(self):
        """Load tất cả active responses từ database"""
        self.responses = ChatbotResponse.objects.filter(is_active=True).order_by('-priority')

    def get_or_create_conversation(self, user, conversation_id=None, context=None):
        """Lấy conversation hiện tại hoặc tạo mới"""
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=user, is_active=True)
                # Update context nếu có
                if context:
                    if 'current_page' in context:
                        conversation.current_page = context['current_page']
                    if 'current_exam' in context:
                        conversation.current_exam_id = context['current_exam']
                    if 'current_subject' in context:
                        conversation.current_subject_id = context['current_subject']
                    conversation.save()
                return conversation
            except Conversation.DoesNotExist:
                pass

        # Tạo conversation mới
        title = f"Hỗ trợ - {timezone.now().strftime('%d/%m/%Y %H:%M')}"
        conversation = Conversation.objects.create(
            user=user,
            title=title,
            current_page=context.get('current_page') if context else None,
            current_exam_id=context.get('current_exam') if context else None,
            current_subject_id=context.get('current_subject') if context else None
        )
        return conversation

    def find_rule_based_response(self, message):
        """Tìm response dựa trên rules"""
        message_lower = message.lower().strip()
        
        for response in self.responses:
            try:
                # Chuyển pattern thành regex
                pattern = response.pattern.lower()
                # Thay thế wildcards
                pattern = pattern.replace('*', '.*')
                pattern = f'^{pattern}$'
                
                if re.match(pattern, message_lower, re.IGNORECASE):
                    return {
                        'response': response.response,
                        'response_type': 'rule_based',
                        'confidence_score': 1.0,
                        'quick_replies': response.quick_replies or []
                    }
            except re.error:
                # Bỏ qua invalid regex patterns
                continue
        
        return None

    def generate_ai_response(self, message, conversation):
        """Tạo response sử dụng AI service"""
        context = {
            'user_role': conversation.user.role,
            'current_page': conversation.current_page,
            'current_exam': conversation.current_exam.title if conversation.current_exam else None,
            'current_subject': conversation.current_subject.name if conversation.current_subject else None
        }
        
        return ai_service.generate_response(message, context)

    def generate_fallback_response(self, message, conversation):
        """Tạo response fallback khi không match rule nào và AI không khả dụng"""
        fallback_responses = [
            {
                'response': "Xin lỗi, tôi chưa hiểu câu của bạn. Bạn có thể thử hỏi lại theo cách khác không?",
                'quick_replies': ["Hướng dẫn sử dụng", "Câu hỏi thường gặp", "Liên hệ hỗ trợ"]
            },
            {
                'response': "Tôi có thể giúp bạn tìm hiểu về các chủ đề: hướng dẫn làm bài thi, xem kết quả, quản lý tài khoản. Bạn muốn biết về vấn đề nào?",
                'quick_replies': ["Hướng dẫn làm bài thi", "Xem kết quả", "Quản lý tài khoản"]
            },
            {
                'response': "Cảm ơn câu hỏi của bạn. Để được hỗ trợ tốt hơn, bạn có thể mô tả chi tiết hơn về vấn đề bạn đang gặp phải.",
                'quick_replies': ["Gặp lỗi kỹ thuật", "Cần hướng dẫn", "Góp ý"]
            }
        ]

        import random
        selected = random.choice(fallback_responses)
        
        return {
            'response': selected['response'],
            'response_type': 'fallback',
            'confidence_score': 0.3,
            'quick_replies': selected['quick_replies']
        }

    def process_message(self, user, message, conversation_id=None, context=None):
        """Xử lý tin nhắn từ user và trả về response"""
        # Lấy hoặc tạo conversation
        conversation = self.get_or_create_conversation(user, conversation_id, context)
        
        # Lưu tin nhắn của user
        user_message = Message.objects.create(
            conversation=conversation,
            sender_type='user',
            content=message
        )

        # Thử tìm response rule-based trước
        rule_response = self.find_rule_based_response(message)
        
        if rule_response:
            bot_response_data = rule_response
        else:
            # Thử dùng AI
            try:
                ai_response = self.generate_ai_response(message, conversation)
                if ai_response and ai_response.get('confidence_score', 0) > 0.3:
                    bot_response_data = ai_response
                else:
                    bot_response_data = self.generate_fallback_response(message, conversation)
            except Exception as e:
                print(f"AI service error: {str(e)}")
                bot_response_data = self.generate_fallback_response(message, conversation)

        # Lưu response của bot
        bot_message = Message.objects.create(
            conversation=conversation,
            sender_type='bot',
            content=bot_response_data['response'],
            response_type=bot_response_data['response_type'],
            confidence_score=bot_response_data.get('confidence_score')
        )

        # Update conversation timestamp
        conversation.updated_at = timezone.now()
        conversation.save()

        return {
            'message': bot_response_data['response'],
            'conversation_id': conversation.id,
            'response_type': bot_response_data['response_type'],
            'confidence_score': bot_response_data.get('confidence_score'),
            'quick_replies': bot_response_data.get('quick_replies', [])
        }

    def get_conversation_history(self, user, conversation_id=None, limit=50):
        """Lấy lịch sử trò chuyện"""
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=user)
                messages = conversation.messages.all()[:limit]
                return ConversationSerializer(conversation).data
            except Conversation.DoesNotExist:
                return None

        # Lấy tất cả conversations của user
        conversations = Conversation.objects.filter(user=user).order_by('-updated_at')
        return ConversationSerializer(conversations, many=True).data

    def create_default_responses(self):
        """Tạo các responses mặc định cho chatbot"""
        default_responses = [
            {
                'pattern': '*xin chào*|*hello*|*hi*',
                'response': 'Xin chào! Tôi là trợ lý ảo của ThiTNOnline. Tôi có thể giúp gì cho bạn hôm nay?',
                'category': 'greeting',
                'priority': 10,
                'quick_replies': ['Hướng dẫn sử dụng', 'Câu hỏi thường gặp', 'Liên hệ hỗ trợ']
            },
            {
                'pattern': '*làm bài thi*|*bắt đầu thi*',
                'response': 'Để làm bài thi, bạn vào trang "Danh sách bài thi", chọn bài thi muốn làm và nhấn "Bắt đầu làm bài". Bạn có thể xem lại câu trả lời trước khi nộp bài.',
                'category': 'exam',
                'priority': 8,
                'quick_replies': ['Danh sách bài thi', 'Xem kết quả', 'Hướng dẫn chi tiết']
            },
            {
                'pattern': '*xem kết quả*|*điểm thi*',
                'response': 'Bạn có thể xem kết quả thi trong trang "Kết quả thi". Tại đây bạn sẽ thấy điểm số, thời gian làm bài và chi tiết các câu trả lời.',
                'category': 'exam',
                'priority': 8,
                'quick_replies': ['Đi đến kết quả', 'Thống kê', 'Xem lịch sử']
            },
            {
                'pattern': '*quên mật khẩu*|*đổi mật khẩu*',
                'response': 'Để đổi mật khẩu, bạn vào mục "Hồ sơ" -> "Đổi mật khẩu". Nếu quên mật khẩu, bạn có thể sử dụng chức năng "Quên mật khẩu" ở trang đăng nhập.',
                'category': 'account',
                'priority': 9,
                'quick_replies': ['Đổi mật khẩu', 'Quên mật khẩu', 'Cập nhật hồ sơ']
            },
            {
                'pattern': '*help*|*trợ giúp*|*hỗ trợ*',
                'response': 'Tôi có thể giúp bạn các vấn đề: hướng dẫn làm bài thi, xem kết quả, quản lý tài khoản, và các câu hỏi thường gặp. Bạn cần hỗ trợ vấn đề gì?',
                'category': 'help',
                'priority': 7,
                'quick_replies': ['Hướng dẫn làm bài thi', 'Quản lý tài khoản', 'Câu hỏi thường gặp']
            },
            {
                'pattern': '*cảm ơn*|*thank*',
                'response': 'Rất vui vì đã giúp được bạn! Nếu có câu hỏi nào khác, đừng ngần ngại hỏi nhé.',
                'category': 'greeting',
                'priority': 5
            },
            {
                'pattern': '*tạm biệt*|*bye*|*chào*',
                'response': 'Chào bạn và chúc bạn học tốt! Hẹn gặp lại.',
                'category': 'greeting',
                'priority': 5
            }
        ]

        for response_data in default_responses:
            ChatbotResponse.objects.get_or_create(
                pattern=response_data['pattern'],
                defaults={
                    'response': response_data['response'],
                    'category': response_data['category'],
                    'priority': response_data['priority'],
                    'quick_replies': response_data.get('quick_replies', [])
                }
            )

        self.load_responses()


# Global instance
chatbot_service = ChatbotService()
