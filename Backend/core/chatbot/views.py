from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import re

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """
    Endpoint Chatbot sử dụng Rule-based nâng cao.
    """
    message = request.data.get('message', '').strip()
    if not message:
        return Response(
            {'error': 'Tin nhắn không được để trống'},
            status=status.HTTP_400_BAD_REQUEST
        )

    response_text = get_rule_based_response(message)
    
    return Response({
        'response': response_text,
        'mode': 'Bot trợ giúp',
        'fallback': True
    })

def get_rule_based_response(message):
    """
    Hệ thống nhận diện ý định (Intent Mapping) - Ưu tiên cao nhất cho LIÊN HỆ.
    """
    msg = message.lower()
    
    # --- 1. LIÊN HỆ BAN QUẢN TRỊ (ƯU TIÊN CAO NHẤT) ---
    if any(k in msg for k in ['liên hệ', 'gmail', 'số điện thoại', 'sdt', 'admin', 'gặp admin']):
        return ('📞 **Thông tin liên hệ Ban quản trị:**\n\n'
                'Nếu bạn cần hỗ trợ trực tiếp hoặc giải quyết sự cố khẩn cấp, hãy liên hệ qua:\n'
                '• **Gmail:** traluong210@gmail.com\n'
                '• **Số điện thoại/Zalo:** 0904 487 600\n'
                '• **Hỗ trợ:** Phục vụ nhiệt tình từ 8:00 đến 22:00.\n\n'
                '*Chúng tôi luôn sẵn sàng đồng hành cùng bạn!*')

    # --- 2. HƯỚNG DẪN THI CỬ ---
    if any(k in msg for k in ['cách thi', 'làm bài', 'bắt đầu thi', 'thi như thế nào', 'nộp bài']):
        return ('📝 **Quy trình làm bài thi chuẩn:**\n\n'
                '1. **Truy cập:** Chọn menu "Khóa Học" → Tìm đến lớp học của bạn.\n'
                '2. **Chọn đề:** Danh sách bài thi sẽ hiển thị theo từng lớp. Click vào bài thi bạn muốn làm.\n'
                '3. **Lưu ý:** Đọc kỹ thời gian làm bài và số câu hỏi trước khi nhấn "Bắt đầu".\n'
                '4. **Làm bài:** Chọn đáp án cho từng câu. Hệ thống sẽ tự động lưu lại.\n'
                '5. **Hoàn thành:** Nhấn nút "Nộp bài" ở cuối trang hoặc trên thanh công cụ.\n\n'
                '**Lưu ý:** Nếu gặp sự cố mất mạng khi đang thi, hãy bình tĩnh tải lại trang (F5) để tiếp tục.')

    # --- 3. XEM KẾT QUẢ & ĐIỂM SỐ ---
    if any(k in msg for k in ['điểm', 'kết quả', 'xem bài', 'đáp án', 'sai câu nào']):
        return ('📊 **Hướng dẫn xem kết quả và đáp án:**\n\n'
                '• **Xem nhanh:** Ngay sau khi nộp bài, hệ thống sẽ hiển thị điểm số của bạn.\n'
                '• **Xem lại lịch sử:** Vào menu "Dashboard" để xem biểu đồ và danh sách các lần thi gần đây.\n'
                '• **Xem chi tiết:** Vào trang lớp học → Tab "Bài nộp" → Nhấn vào bài thi đã làm để xem chi tiết câu đúng/sai và lời giải (nếu giáo viên cho phép).')

    # --- 4. VẤN ĐỀ LỚP HỌC ---
    if any(k in msg for k in ['vào lớp', 'tìm lớp', 'không thấy lớp', 'thêm vào lớp']):
        return ('🏫 **Vấn đề về Lớp học:**\n\n'
                '• **Học sinh:** Bạn cần cung cấp tên đăng nhập cho Giáo viên để được thêm vào lớp. Khi đã vào lớp, bạn sẽ thấy lớp đó trong mục "Khóa Học".\n'
                '• **Giáo viên:** Bạn có thể quản lý danh sách học sinh và tạo bài thi mới trong phần quản trị lớp học của mình.\n\n'
                'Nếu bạn đã được thêm nhưng vẫn không thấy lớp, hãy thử đăng xuất và đăng nhập lại.')

    # --- 5. TÀI KHOẢN & MẬT KHẨU ---
    if any(k in msg for k in ['mật khẩu', 'password', 'đổi thông tin', 'quên mật khẩu', 'avata']):
        return ('🔐 **Quản lý tài khoản:**\n\n'
                '• **Quên mật khẩu:** Liên hệ trực tiếp với Giáo viên quản lý lớp để được cấp lại mật khẩu mới nhanh nhất.\n'
                '• **Cập nhật thông tin:** Bạn có thể thay đổi họ tên, ảnh đại diện tại trang "Hồ sơ cá nhân".\n'
                '• **Bảo mật:** Không chia sẻ tài khoản cho người khác để tránh mất dữ liệu thi cử.')

    # --- 6. SỰ CỐ KỸ THUẬT ---
    if any(k in msg for k in ['lỗi', 'không load được', 'đứng máy', 'lag', 'không ấn được']):
        return ('🔧 **Cách khắc phục sự cố nhanh:**\n\n'
                '1. **Tải lại trang:** Nhấn phím F5 hoặc biểu tượng Refresh trên trình duyệt.\n'
                '2. **Kiểm tra Internet:** Đảm bảo kết nối mạng của bạn ổn định.\n'
                '3. **Xóa Cache:** Nếu giao diện hiển thị sai, hãy thử xóa lịch sử duyệt web hoặc mở tab ẩn danh.\n'
                '4. **Trình duyệt:** Khuyên dùng Google Chrome hoặc Microsoft Edge phiên bản mới nhất.\n\n'
                'Nếu vẫn không được, hãy báo ngay cho Giáo viên hoặc Admin qua Gmail/SĐT.')

    # --- 7. CHÀO HỎI & GIỚI THIỆU ---
    if any(k in msg for k in ['chào', 'hello', 'hi', 'xin chào', 'có đó không', 'hey']):
        return ('Xin chào! 👋 Tôi là Robot hỗ trợ trực tuyến của hệ thống Thi Trắc Nghiệm.\n\n'
                'Tôi có thể giúp bạn giải đáp nhanh các vấn đề về:\n'
                '• **Liên hệ:** Thông tin Gmail/SĐT của Admin.\n'
                '• **Thi cử:** Cách làm bài, nộp bài, thời gian thi.\n'
                '• **Kết quả:** Xem điểm, xem đáp án.\n\n'
                'Bạn đang gặp khó khăn ở phần nào?')

    # --- 8. CẢM ƠN & TẠM BIỆT ---
    if any(k in msg for k in ['cảm ơn', 'thanks', 'thank you', 'ok', 'được rồi']):
        return 'Dạ không có gì ạ! 😊 Chúc bạn có những giờ học tập và thi cử thật hiệu quả trên hệ thống. Cần gì cứ hỏi tôi nhé!'

    if any(k in msg for k in ['tạm biệt', 'bye', 'hẹn gặp lại', 'nghỉ đây']):
        return 'Tạm biệt bạn! 👋 Chúc bạn một ngày tốt lành. Hy vọng sẽ sớm được hỗ trợ bạn lần sau!'

    # --- 9. MẶC ĐỊNH ---
    return ('🤖 **Tôi chưa hiểu ý bạn lắm.**\n\n'
            'Thử hỏi về: "làm bài thi", "xem kết quả", "liên hệ admin", "quên mật khẩu"... để tôi hỗ trợ nhanh nhất nhé!')
