import os
from openai import OpenAI
from django.conf import settings
from .gemini_service import gemini_ai_service


class AIService:
    def __init__(self):
        # Khởi tạo OpenAI service
        openai_key = getattr(settings, 'OPENAI_API_KEY', os.getenv('OPENAI_API_KEY'))
        if openai_key and openai_key != 'your-openai-api-key-here':
            self.openai_client = OpenAI(api_key=openai_key)
            self.openai_model = getattr(settings, 'OPENAI_MODEL', 'gpt-3.5-turbo')
            self.openai_max_tokens = getattr(settings, 'OPENAI_MAX_TOKENS', 150)
            self.openai_temperature = getattr(settings, 'OPENAI_TEMPERATURE', 0.7)
            self.openai_available = True
        else:
            self.openai_available = False
            print("OpenAI API key not configured")

        # Gemini service đã được khởi tạo trong gemini_ai_service
        self.gemini_service = gemini_ai_service

    def generate_response(self, message, context=None):
        """
        Tạo response từ AI service (ưu tiên Gemini, fallback OpenAI)
        
        Args:
            message: Tin nhắn của user
            context: Dict chứa context (current_page, exam, subject, role)
        
        Returns:
            Dict: {response, confidence_score, response_type}
        """
        # Thử Gemini trước (miễn phí)
        if self.gemini_service.is_available:
            gemini_response = self.gemini_service.generate_response(message, context)
            if gemini_response:
                return gemini_response

        # Fallback sang OpenAI nếu có key
        if self.openai_available:
            return self._generate_openai_response(message, context)

        # Không có AI service nào khả dụng
        return None

    def _generate_openai_response(self, message, context):
        """Tạo response từ OpenAI API"""
        try:
            # Xây dựng system prompt dựa trên context
            system_prompt = self._build_system_prompt(context)
            
            # Tạo messages cho OpenAI
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ]

            response = self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=messages,
                max_tokens=self.openai_max_tokens,
                temperature=self.openai_temperature,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )

            ai_response = response.choices[0].message.content.strip()
            
            # Tính confidence score dựa trên response length và content
            confidence_score = self._calculate_confidence_score(ai_response, message)
            
            return {
                'response': ai_response,
                'response_type': 'ai_generated',
                'confidence_score': confidence_score,
                'model_used': self.openai_model
            }

        except Exception as e:
            print(f"Error calling OpenAI API: {str(e)}")
            return None

    def _build_system_prompt(self, context):
        """Xây dựng system prompt dựa trên context"""
        base_prompt = """Bạn là trợ lý ảo cho hệ thống thi trắc nghiệm online ThiTNOnline. 
Nhiệm vụ của bạn là giúp học sinh và giáo viên sử dụng hệ thống hiệu quả.

Hướng dẫn trả lời:
1. Luôn trả lời bằng tiếng Việt
2. Ngắn gọn, dễ hiểu, thân thiện
3. Tập trung vào vấn đề học tập và sử dụng hệ thống
4. Nếu không biết câu trả lời, hãy nói thẳng và gợi ý các câu hỏi khác
5. Không tạo thông tin sai về hệ thống

Các chức năng chính của hệ thống:
- Đăng bài thi trắc nghiệm
- Làm bài thi và xem kết quả
- Quản lý lớp học và môn học
- Xem thống kê và báo cáo
- Thông báo và nhắc nhở"""

        if context:
            context_info = []
            
            if context.get('user_role'):
                role = context['user_role']
                if role == 'student':
                    context_info.append("Bạn đang nói chuyện với học sinh")
                elif role == 'teacher':
                    context_info.append("Bạn đang nói chuyện với giáo viên")
                elif role == 'admin':
                    context_info.append("Bạn đang nói chuyện với quản trị viên")

            if context.get('current_page'):
                page = context['current_page']
                context_info.append(f"User đang ở trang: {page}")

            if context.get('current_exam'):
                exam = context['current_exam']
                context_info.append(f"User đang xem bài thi: {exam}")

            if context.get('current_subject'):
                subject = context['current_subject']
                context_info.append(f"User đang học môn: {subject}")

            if context_info:
                base_prompt += f"\n\nContext hiện tại:\n" + "\n".join(context_info)

        return base_prompt

    def _calculate_confidence_score(self, response, user_message):
        """
        Tính confidence score cho AI response
        """
        score = 0.5  # Base score
        
        # Tăng score nếu response có độ dài hợp lý
        if 10 <= len(response) <= 500:
            score += 0.2
        
        # Tăng score nếu response chứa từ khóa liên quan
        educational_keywords = ['học', 'thi', 'bài', 'điểm', 'lớp', 'môn', 'hệ thống', 'sử dụng']
        if any(keyword in response.lower() for keyword in educational_keywords):
            score += 0.2
        
        # Tăng score nếu response trả lời đúng câu hỏi
        if any(word in response.lower() for word in user_message.lower().split()[:3]):
            score += 0.1
        
        return min(score, 1.0)

    def get_available_models(self):
        """Trả về danh sách các AI models khả dụng"""
        models = []
        if self.gemini_service.is_available:
            models.append({
                'name': 'gemini-pro',
                'provider': 'Google',
                'status': 'available'
            })
        else:
            models.append({
                'name': 'gemini-pro',
                'provider': 'Google',
                'status': 'unavailable - needs API key'
            })
            
        if self.openai_available:
            models.append({
                'name': self.openai_model,
                'provider': 'OpenAI',
                'status': 'available'
            })
        else:
            models.append({
                'name': 'gpt-3.5-turbo',
                'provider': 'OpenAI',
                'status': 'unavailable - needs API key'
            })
        
        return models


# Global instance
ai_service = AIService()
