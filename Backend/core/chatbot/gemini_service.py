import os
import google.generativeai as genai
from django.conf import settings


class GeminiAIService:
    def __init__(self):
        api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY')
        print(f"DEBUG: Gemini API key from getattr: {getattr(settings, 'GEMINI_API_KEY', None)}")
        print(f"DEBUG: Gemini API key from getenv: {os.getenv('GEMINI_API_KEY')}")
        print(f"DEBUG: Final Gemini API key: {api_key}")
        
        if api_key and api_key != 'your-gemini-api-key-here':
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(
                model_name=getattr(settings, 'GEMINI_MODEL', 'gemini-pro')
            )
            self.is_available = True
            print("DEBUG: Gemini service initialized successfully")
        else:
            self.is_available = False
            print("DEBUG: Gemini API key not configured. Using rule-based responses only.")

    def generate_response(self, message, context=None):
        """
        Tạo response từ Gemini API
        
        Args:
            message: Tin nhắn của user
            context: Dict chứa context (current_page, exam, subject, role)
        
        Returns:
            Dict: {response, confidence_score, response_type}
        """
        if not self.is_available:
            return None

        try:
            # Xây dựng system prompt dựa trên context
            system_prompt = self._build_system_prompt(context)
            
            # Tạo messages cho Gemini
            full_prompt = f"{system_prompt}\n\nUser: {message}\nAssistant: "

            response = self.model.generate_content(full_prompt)
            ai_response = response.text.strip()
            
            # Tính confidence score
            confidence_score = self._calculate_confidence_score(ai_response, message)
            
            return {
                'response': ai_response,
                'response_type': 'ai_generated',
                'confidence_score': confidence_score,
                'model_used': 'gemini-pro'
            }

        except Exception as e:
            print(f"Error calling Gemini API: {str(e)}")
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


# Global instance
gemini_ai_service = GeminiAIService()
