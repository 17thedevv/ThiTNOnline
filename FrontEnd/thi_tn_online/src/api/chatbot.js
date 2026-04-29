// AI Chatbot Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ChatbotService {
  async sendMessage(message, conversationHistory = [], userContext = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: message,
          conversation_history: conversationHistory,
          user_context: userContext
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Chatbot service error:', error);
      throw error;
    }
  }

  getUserContext() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentPath = window.location.pathname;
    
    return {
      role: user.role || 'guest',
      name: `${user.last_name || ''} ${user.first_name || ''}`.trim() || user.username || 'bạn',
      currentPage: currentPath
    };
  }

  getFallbackResponse(message) {
    const input = message.toLowerCase().trim();
    const context = this.getUserContext();
    
    // --- 1. NHẬN DIỆN LIÊN HỆ (ĐƯA LÊN ĐẦU ĐỂ ƯU TIÊN CAO NHẤT) ---
    if (/(liên hệ|gmail|sdt|số điện thoại|fb|zalo|admin|gặp admin|trợ giúp trực tiếp)/i.test(input)) {
        return `📞 **Thông tin liên hệ Ban quản trị:**

Nếu bạn cần hỗ trợ trực tiếp từ Admin, hãy liên hệ qua:
• **Gmail:** traluong210@gmail.com
• **Số điện thoại/Zalo:** 0904 487 600
• **Hỗ trợ:** Từ 8:00 - 22:00 hàng ngày.

*Chúng tôi luôn sẵn sàng hỗ trợ bạn!*`;
    }

    // --- 2. NHẬN DIỆN Ý ĐỊNH LÀM BÀI THI ---
    if (/\b(thi|làm bài|vào thi|bắt đầu|cách thi|exam|test|nộp bài)\b/i.test(input)) {
        return `📝 **Hướng dẫn làm bài thi chi tiết:**

**Bước 1:** Click vào menu **"Khóa Học"** phía trên thanh điều hướng.
**Bước 2:** Tìm và chọn đúng **Lớp học** bạn đang theo học.
**Bước 3:** Hệ thống sẽ hiện danh sách bài thi. Click vào bài thi bạn muốn làm.
**Bước 4:** Đọc kỹ thời gian và quy định, sau đó nhấn **"Bắt đầu làm bài"**.
**Bước 5:** Sau khi chọn xong đáp án, đừng quên nhấn nút **"Nộp bài"** ở cuối trang nhé!

*Chúc bạn hoàn thành bài thi thật tốt!*`;
    }

    // --- 3. NHẬN DIỆN CHÀO HỎI (LOẠI BỎ TỪ "VỚI" GÂY NHẦM LẪN) ---
    if (/\b(chào|hello|hi|xin chào|hey|tư vấn|giúp)\b/i.test(input)) {
        return `Xin chào ${context.name}! 👋 Tôi là Robot hỗ trợ tự động của hệ thống Thi Trắc Nghiệm.
        
Tôi có thể giúp bạn giải đáp cực nhanh các vấn đề về:
• **Làm bài thi:** Cách vào thi, nộp bài.
• **Kết quả:** Xem điểm, xem lại bài làm.
• **Lớp học:** Cách tham gia lớp, liên hệ giáo viên.
• **Tài khoản:** Đăng nhập, mật khẩu.

Bạn hãy gõ từ khóa ví dụ như "cách thi" hoặc "xem điểm" để tôi hướng dẫn nhé!`;
    }

    // --- 4. NHẬN DIỆN XEM ĐIỂM ---
    if (/(điểm|kết quả|xem lại|đáp án|score|result)/i.test(input)) {
        return `📊 **Cách xem điểm và kết quả:**

• **Cách 1:** Ngay sau khi nộp bài, hệ thống sẽ hiện điểm số và số câu đúng ngay lập tức.
• **Cách 2:** Bạn có thể vào trang **Dashboard** (Tổng quan) để xem thống kê điểm của tất cả các bài đã thi.
• **Cách 3:** Vào trang **Lớp học** → Chọn tab **"Bài nộp"** để xem chi tiết đáp án đúng/sai của từng câu hỏi.`;
    }

    // --- 5. NHẬN DIỆN LỚP HỌC ---
    if (/(lớp|class|khóa học|môn học|course)/i.test(input)) {
        return `🏫 **Thông tin về Lớp học:**

• Để vào lớp: Chọn mục **"Khóa Học"** trên Menu.
• Nếu bạn không thấy lớp của mình: Hãy liên hệ với **Giáo viên** để được thêm vào danh sách lớp bằng họ tên hoặc username của bạn.
• Lưu ý: Mỗi tài khoản sẽ có một danh sách lớp riêng do giáo viên quản lý.`;
    }

    // --- 6. NHẬN DIỆN TÀI KHỎI / MẬT KHẨU ---
    if (/(tài khoản|mật khẩu|password|đăng nhập|login|profile|hồ sơ)/i.test(input)) {
        return `🔐 **Hỗ trợ Tài khoản:**

• **Quên mật khẩu:** Vui lòng liên hệ trực tiếp với **Giáo viên quản lý** của bạn để được reset mật khẩu mới.
• **Đổi thông tin:** Bạn có thể vào trang **Profile** (Hồ sơ) để thay đổi họ tên, ảnh đại diện và Email.
• **Lỗi đăng nhập:** Đảm bảo bạn nhập đúng User và Pass, không bật Caps Lock. Thử gõ mật khẩu ra ngoài để kiểm tra trước khi dán vào ô đăng nhập.`;
    }

    // --- 7. NHẬN DIỆN LỖI / SỰ CỐ ---
    if (/(lỗi|không được|hỏng|lag|đứng|quay vòng)/i.test(input)) {
        return `🔧 **Xử lý sự cố nhanh:**

1. Nhấn phím **F5** để tải lại trang.
2. Kiểm tra lại kết nối Interner (Wifi/4G).
3. Sử dụng trình duyệt **Chrome** hoặc **Edge** phiên bản mới nhất.
4. Nếu đang làm bài thi mà bị lỗi, hãy bình tĩnh tải lại trang, hệ thống đã lưu các câu trả lời trước đó của bạn.

Nếu vẫn không được, hãy báo ngay cho Giáo viên hoặc Ban quản trị qua Zalo nhé!`;
    }

    // --- 8. NHẬN DIỆN CẢM ƠN / TẠM BIỆT ---
    if (/(cảm ơn|thanks|thank|ok|bye|tạm biệt)/i.test(input)) {
        return `Rất vui vì đã hỗ trợ được bạn! 😊 Chúc bạn học tập tốt và đạt kết quả cao trong các kỳ thi sắp tới.

Tôi sẽ luôn ở đây nếu bạn cần giúp đỡ thêm!`;
    }

    // --- 9. DEFAULT ---
    return `🤔 Tôi chưa hiểu ý bạn lắm.

Bạn có thể gõ các từ như: "cách thi", "xem điểm", "liên hệ admin", "quên mật khẩu"... để tôi hỗ trợ nhanh nhất nhé!`;
  }
}

export const chatbotService = new ChatbotService();
