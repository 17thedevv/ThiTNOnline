from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
import google.genai as genai
import os
from django.conf import settings

@api_view(['POST'])
@permission_classes([AllowAny])  # Public endpoint for testing
def test_chat_with_ai(request):
    """
    Public AI Chatbot endpoint for testing (no auth required)
    """
    try:
        message = request.data.get('message', '')
        
        if not message.strip():
            return Response(
                {'error': 'Message cannot be empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize Gemini
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        
        if not api_key or api_key == 'your-gemini-api-key-here':
            # Fallback to rule-based responses if Gemini is not configured
            return Response({
                'response': get_rule_based_response(message),
                'fallback': True,
                'mode': 'rule-based (no Gemini API key)'
            })
        
        try:
            # Configure Gemini with new package
            client = genai.Client(api_key=api_key)
            
            # Prepare system prompt
            system_prompt = """Bạn là trợ lý AI cho hệ thống thi trắc nghiệm trực tuyến. 
            Nhiệm vụ của bạn là giúp đỡ học sinh và giáo viên về:
            - Hướng dẫn làm bài thi
            - Quản lý lớp học  
            - Xem kết quả thi
            - Các vấn đề kỹ thuật cơ bản
            - Quy định thi cử
            
            Hãy trả lời một cách thân thiện, chuyên nghiệp và bằng tiếng Việt. 
            Nếu không biết câu trả lời, hãy đề nghị người dùng liên hệ giáo viên.
            
            Hãy trả lời ngắn gọn, dễ hiểu và tập trung vào vấn đề người dùng hỏi."""
            
            # Combine system prompt and user message
            full_prompt = f"{system_prompt}\n\nNgười dùng hỏi: {message}"
            
            # Get response from Gemini
            response = client.models.generate_content(
                model=getattr(settings, 'GEMINI_MODEL', 'gemini-1.5-flash'),
                contents=full_prompt
            )
            
            ai_response = response.text
            
            return Response({
                'response': ai_response,
                'fallback': False,
                'mode': 'AI (Gemini)',
                'api_key_status': 'configured'
            })
            
        except Exception as gemini_error:
            print(f"Gemini API error: {str(gemini_error)}")
            # Fallback to rule-based responses on Gemini error
            return Response({
                'response': get_rule_based_response(message),
                'fallback': True,
                'mode': 'rule-based (Gemini error)',
                'error': str(gemini_error)
            })
        
    except Exception as e:
        print(f"AI Chatbot error: {str(e)}")
        # Fallback to rule-based responses on any error
        return Response({
            'response': get_rule_based_response(message),
            'fallback': True,
            'mode': 'rule-based (general error)',
            'error': str(e)
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """
    AI Chatbot endpoint using OpenAI - Requires authentication
    """
    try:
        message = request.data.get('message', '')
        conversation_history = request.data.get('conversation_history', [])
        
        if not message.strip():
            return Response(
                {'error': 'Message cannot be empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize OpenAI
        api_key = getattr(settings, 'OPENAI_API_KEY', None)
        
        if not api_key or api_key == 'your-openai-api-key-here':
            # Fallback to rule-based responses if OpenAI is not configured
            return Response({
                'response': get_rule_based_response(message),
                'fallback': True
            })
        
        try:
            # Configure OpenAI
            openai.api_key = api_key
            
            # Prepare system prompt
            system_prompt = """Bạn là trợ lý AI cho hệ thống thi trắc nghiệm trực tuyến. 
            Nhiệm vụ của bạn là giúp đỡ học sinh và giáo viên về:
            - Hướng dẫn làm bài thi
            - Quản lý lớp học  
            - Xem kết quả thi
            - Các vấn đề kỹ thuật cơ bản
            - Quy định thi cử
            
            Hãy trả lời một cách thân thiện, chuyên nghiệp và bằng tiếng Việt. 
            Nếu không biết câu trả lời, hãy đề nghị người dùng liên hệ giáo viên.
            
            Hãy trả lời ngắn gọn, dễ hiểu và tập trung vào vấn đề người dùng hỏi."""
            
            # Prepare messages with conversation history
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # Add conversation history (limit to last 10 messages)
            for msg in conversation_history[-10:]:
                messages.append({
                    "role": msg.get('role', 'user'),
                    "content": msg.get('content', '')
                })
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model=getattr(settings, 'OPENAI_MODEL', 'gpt-3.5-turbo'),
                messages=messages,
                max_tokens=getattr(settings, 'OPENAI_MAX_TOKENS', 500),
                temperature=getattr(settings, 'OPENAI_TEMPERATURE', 0.7)
            )
            
            ai_response = response.choices[0].message.content
            
            return Response({
                'response': ai_response,
                'fallback': False
            })
            
        except Exception as openai_error:
            print(f"OpenAI API error: {str(openai_error)}")
            # Fallback to rule-based responses on OpenAI error
            return Response({
                'response': get_rule_based_response(message),
                'fallback': True
            })
        
    except Exception as e:
        print(f"AI Chatbot error: {str(e)}")
        # Fallback to rule-based responses on any error
        return Response({
            'response': get_rule_based_response(message),
            'fallback': True
        })

def get_rule_based_response(message):
    """
    Enhanced rule-based responses when AI is not available
    """
    message_lower = message.lower()
    
    # Enhanced greeting with context
    if any(keyword in message_lower for keyword in ['chào', 'hello', 'hi', 'xin chào']):
        return '''Xin chào! 👋 

Tôi là trợ lý AI thông minh của hệ thống thi trắc nghiệm trực tuyến. Tôi được thiết kế chuyên biệt để hỗ trợ:

🎓 **Học sinh & Giáo viên** trong việc học tập và thi cử
📚 **Hệ thống thi online** với đầy đủ tính năng hiện đại
🔧 **Vấn đề kỹ thuật** một cách nhanh chóng

Tôi có thể giúp bạn về:
• Hướng dẫn làm bài thi chi tiết
• Quản lý lớp học hiệu quả  
• Xem kết quả và điểm số
• Các vấn đề kỹ thuật cơ bản
• Hỗ trợ 24/7 hoàn toàn miễn phí

Bạn cần tôi giúp gì ngay bây giờ?'''
    
    # Enhanced exam instructions
    elif any(keyword in message_lower for keyword in ['thi', 'bài thi', 'làm bài', 'exam']):
        return '''📝 **Hướng dẫn làm bài thi chi tiết:**

**Bước 1: Truy cập bài thi**
1. Đăng nhập vào hệ thống
2. Vào mục "Khóa Học" trên thanh menu
3. Chọn môn học bạn muốn thi
4. Click vào bài thi cần làm

**Bước 2: Bắt đầu làm bài**
1. Đọc kỹ thông tin: thời gian, số câu hỏi, điểm
2. Click "Bắt đầu làm bài"
3. Hệ thống sẽ đếm ngược thời gian

**Bước 3: Làm bài thi**
• Chọn đáp án A, B, C, D cho mỗi câu hỏi
• Có thể thay đổi đáp án trước khi nộp bài
• Theo dõi thời gian còn lại

**Bước 4: Nộp bài**
1. Kiểm tra lại tất cả câu trả lời
2. Click "Nộp bài"
3. Xem kết quả ngay lập tức

⚠️ **Lưu ý quan trọng:**
• Đọc kỹ hướng dẫn trước khi bắt đầu
• Quản lý thời gian hợp lý
• Chỉ được làm bài 1 lần (trừ khi được phép)

Bạn cần giúp thêm về bước nào cụ thể?'''
    
    # Enhanced class management
    elif any(keyword in message_lower for keyword in ['lớp', 'lớp học', 'class']):
        return '''🏫 **Quản lý lớp học thông minh:**

**👨‍🏫 Dành cho Giáo viên:**
• Tạo lớp học mới cho từng môn
• Thêm/xóa học sinh dễ dàng
• Tạo và quản lý bài thi
• Xem thống kê kết quả toàn lớp
• Quản lý điểm số tập trung

**👨‍🎓 Dành cho Học sinh:**
• Xem thông tin chi tiết lớp học
• Tham gia các bài thi được giao
• Xem điểm số và kết quả
• Theo dõi tiến độ học tập

**🔗 Tính năng nổi bật:**
• Giao diện trực quan, dễ sử dụng
• Cập nhật kết quả real-time
• Thông báo tự động khi có bài mới
• Lưu trữ lịch sử thi cử

Bạn đang là giáo viên hay học sinh? Tôi sẽ hướng dẫn chi tiết hơn!'''
    
    # Enhanced results viewing
    elif any(keyword in message_lower for keyword in ['điểm', 'kết quả', 'score', 'result']):
        return '''📊 **Xem kết quả thi chi tiết:**

**👨‍🎓 Học sinh xem điểm:**
1. Vào trang "Lớp học"
2. Chọn tab "Bài nộp"
3. Xem điểm của các bài đã làm
4. Click vào chi tiết để xem:
   • Điểm số từng câu
   • Thời gian làm bài
   • Đáp án đúng/sai
   • Xếp hạng trong lớp

**👨‍🏫 Giáo viên xem điểm:**
1. Vào trang "Lớp học"
2. Chọn tab "Bài nộp"
3. Xem điểm của TẤT CẢ học sinh
4. Thống kê chi tiết:
   • Điểm trung bình lớp
   • Phân phối điểm số
   • Học sinh cần quan tâm
   • Xu hướng học tập

**📈 Thống kê nâng cao:**
• Biểu đồ điểm số
• So sánh giữa các lớp
• Theo dõi tiến độ theo thời gian
• Xuất báo cáo PDF

Bạn muốn xem kết quả của môn học nào?'''
    
    # Enhanced help menu
    elif any(keyword in message_lower for keyword in ['help', 'giúp', 'hỗ trợ', 'support']):
        return '''🤖 **Tôi có thể giúp bạn những gì?**

📚 **HỌC TẬP & THI CỬ:**
• Hướng dẫn làm bài thi A-Z
• Chiến lược làm bài hiệu quả
• Xem và phân tích kết quả
• Các quy định thi cử quan trọng
• Mẹo học tập thông minh

🏫 **QUẢN LÝ LỚP HỌC:**
• Tạo và quản lý lớp học
• Thêm học sinh vào lớp
• Tạo bài thi customized
• Thống kê và báo cáo
• Giao tiếp với học sinh

🔧 **KỸ THUẬT & HỖ TRỢ:**
• Các vấn đề đăng nhập
• Sử dụng hệ thống hiệu quả
• Báo cáo lỗi và sự cố
• Tối ưu hóa trải nghiệm
• Hướng dẫn trên mobile

💡 **TƯ VẤN HỌC TẬP:**
• Lựa chọn môn học phù hợp
• Lộ trình học tập cá nhân
• Phương pháp học online
• Quản lý thời gian học
• Ôn tập hiệu quả

🎯 **ĐỀ XUẤT CÂU HỎI:**
• "Hướng dẫn làm bài thi toán"
• "Cách tạo lớp học mới"
• "Xem điểm môn văn"
• "Lỗi không đăng nhập được"
• "Học online hiệu quả"

Bạn cần hỗ trợ về mảng nào? Tôi sẽ giải thích chi tiết!'''
    
    # Enhanced login help
    elif any(keyword in message_lower for keyword in ['login', 'đăng nhập', 'tài khoản', 'account']):
        return '''🔐 **Hướng dẫn đăng nhập & quản lý tài khoản:**

**📝 Đăng nhập hệ thống:**
1. Truy cập trang chủ
2. Nhập username (do giáo viên cung cấp)
3. Nhập password
4. Click "Đăng nhập"

**🔑 Quên mật khẩu:**
• Liên hệ ngay giáo viên của bạn
• Giáo viên sẽ reset mật khẩu mới
• Không thể tự reset (bảo mật)

**👤 Tạo tài khoản mới:**
• Chỉ giáo viên mới có quyền tạo
• Học sinh sẽ nhận tài khoản từ giáo viên
• Tài khoản bao gồm: username + password

**⚠️ Các lỗi thường gặp:**
• Sai username/password: Kiểm tra lại ký tự
• Không đăng nhập được: Xóa cache trình duyệt
• Tài khoản bị khóa: Liên hệ giáo viên
• Quên thông tin: Hỏi giáo viên lớp học

**🛡️ Bảo mật tài khoản:**
• Không chia sẻ tài khoản cho người khác
• Đổi mật khẩu định kỳ (nếu được phép)
• Luôn đăng xuất sau khi sử dụng

Bạn đang gặp vấn đề gì cụ thể về tài khoản?'''
    
    # Enhanced technical support
    elif any(keyword in message_lower for keyword in ['lỗi', 'error', 'vấn đề', 'problem']):
        return '''🔧 **Giải quyết các vấn đề kỹ thuật:**

**🌐 Các lỗi kết nối:**
1. **Trang không tải được**
   • Kiểm tra kết nối internet
   • Thử refresh trang (F5)
   • Đổi trình duyệt (Chrome, Firefox)
   
2. **Đăng nhập thất bại**
   • Kiểm tra username/password
   • Xóa cache và cookies
   • Thử trang ẩn danh

**📱 Lỗi trên Mobile:**
• Cập nhật app phiên bản mới nhất
• Kiểm tra kết nối WiFi/4G
• Xóa cache ứng dụng
• Cài đặt lại app

**💻 Lỗi trên Desktop:**
• Cập nhật trình duyệt
• Tắt các tiện ích mở rộng
• Kiểm tra JavaScript bật
• Xóa dữ liệu duyệt web

**🚨 Khi nào cần liên hệ hỗ trợ:**
• Lỗi kéo dài > 5 phút
• Nhiều người cùng gặp lỗi
• Mất dữ liệu quan trọng
• Không thể truy cập hệ thống

**📞 Kênh hỗ trợ:**
• Giáo viên của bạn (nhanh nhất)
• Admin hệ thống
• Email hỗ trợ kỹ thuật

Bạn đang gặp lỗi cụ thể nào? Mô tả chi tiết để tôi giúp đỡ!'''
    
    # Enhanced free info
    elif any(keyword in message_lower for keyword in ['miễn phí', 'free', 'giá', 'cost']):
        return '''🎉 **Tôi hoàn toàn MIỄN PHÍ!**

✨ **Các tính năng miễn phí:**
• Trả lời không giới hạn câu hỏi
• Hỗ trợ 24/7 mọi lúc mọi nơi
• Tư vấn học tập cá nhân hóa
• Giải quyết vấn đề kỹ thuật
• Hướng dẫn sử dụng hệ thống

🤖 **Công nghệ AI thông minh:**
• Hiểu ngữ cảnh tự nhiên
• Phản hồi nhanh chóng
• Học hỏi từ tương tác
• Luôn cập nhật kiến thức mới

🎓 **Đặc biệt cho giáo dục:**
• Chuyên biệt cho hệ thống thi cử
• Hiểu biết về các môn học
• Hỗ trợ cả giáo viên và học sinh
• Tư vấn phương pháp học tập

💡 **So với các dịch vụ khác:**
• Không cần đăng ký tài khoản
• Không giới hạn thời gian sử dụng
• Không có quảng cáo phiền nhiễu
• Không yêu cầu thông tin cá nhân

🚀 **Cách sử dụng:**
• Gõ câu hỏi vào ô chat
• Nhấn Enter hoặc click gửi
• Nhận câu trả lời ngay lập tức

Bạn có thể hỏi tôi BẤT CỨ điều gì về học tập và thi cử!'''
    
    # Default enhanced response
    else:
        return '''🤔 **Tôi hiểu câu hỏi của bạn!**

Để giúp bạn tốt nhất, tôi có một vài gợi ý:

🎯 **Cách đặt câu hỏi hiệu quả:**
• Cụ thể và rõ ràng: "Làm bài thi toán thế nào?"
• Cung cấp context: "Tôi là học sinh lớp 10, muốn xem điểm"
• Sử dụng từ khóa: "thi", "lớp", "điểm", "help"

💡 **Các chủ đề tôi hỗ trợ:**
📚 Học tập & Thi cử
🏫 Quản lý lớp học  
📊 Kết quả & Điểm số
🔧 Vấn đề kỹ thuật
🎓 Tư vấn học tập

🔍 **Thử các câu hỏi mẫu:**
• "Hướng dẫn làm bài thi"
• "Cách tạo lớp học mới"
• "Xem điểm môn Anh văn"
• "Lỗi không đăng nhập được"
• "Học online hiệu quả"

Hoặc bạn có thể mô tả chi tiết vấn đề đang gặp phải. Tôi luôn sẵn sàng giúp đỡ! 💪

Bạn cần hỗ trợ gì cụ thể?'''
