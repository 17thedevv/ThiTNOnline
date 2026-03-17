// AI Chatbot Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ChatbotService {
  // Method to send message to AI
  async sendMessage(message, conversationHistory = [], userContext = {}) {
    try {
      // Enhanced prompt with user context
      const enhancedMessage = this.enhanceMessageWithContext(message, userContext);
      
      const response = await fetch(`${API_BASE_URL}/api/chatbot/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: enhancedMessage,
          conversation_history: conversationHistory,
          user_context: userContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chatbot service error:', error);
      throw error;
    }
  }

  // Enhance message with user context
  enhanceMessageWithContext(message, userContext) {
    const { role, name, recentActivity, preferences } = userContext;
    
    let contextInfo = '';
    
    if (role) {
      contextInfo += `Người dùng là ${role === 'teacher' ? 'giáo viên' : 'học sinh'}. `;
    }
    
    if (name) {
      contextInfo += `Tên: ${name}. `;
    }
    
    if (recentActivity) {
      contextInfo += `Hoạt động gần đây: ${recentActivity}. `;
    }
    
    if (preferences) {
      contextInfo += `Sở thích: ${preferences}. `;
    }
    
    return contextInfo ? `${contextInfo}\n\nCâu hỏi: ${message}` : message;
  }

  // Get user context from localStorage and current page
  getUserContext() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentPath = window.location.pathname;
    
    let recentActivity = '';
    if (currentPath.includes('/dashboard')) {
      recentActivity = 'đang xem trang tổng quan';
    } else if (currentPath.includes('/exam/')) {
      recentActivity = 'đang làm bài thi';
    } else if (currentPath.includes('/classes')) {
      recentActivity = 'đang xem lớp học';
    } else if (currentPath.includes('/profile')) {
      recentActivity = 'đang xem hồ sơ';
    }
    
    return {
      role: user.role,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
      recentActivity,
      preferences: this.getUserPreferences(),
      currentPage: currentPath
    };
  }

  // Get user preferences from localStorage
  getUserPreferences() {
    try {
      return JSON.parse(localStorage.getItem('userPreferences') || '{}');
    } catch {
      return {};
    }
  }

  // Fallback to rule-based responses when AI is not available
  getFallbackResponse(message) {
    const input = message.toLowerCase();
    const userContext = this.getUserContext();
    
    // Enhanced pattern matching
    const patterns = {
      // Greetings
      greeting: ['chào', 'hello', 'hi', 'xin chào', 'halo'],
      
      // Exam related
      exam: ['thi', 'bài thi', 'làm bài', 'kiểm tra', 'exam', 'test'],
      createExam: ['tạo bài', 'tạo bài thi', 'tạo đề thi', 'new exam'],
      examResult: ['kết quả thi', 'điểm thi', 'xem điểm', 'score', 'result'],
      
      // Class related
      class: ['lớp', 'lớp học', 'class', 'khóa học', 'course'],
      
      // Help and support
      help: ['help', 'giúp', 'hỗ trợ', 'hướng dẫn', 'support', 'guide'],
      
      // Account related
      account: ['login', 'đăng nhập', 'tài khoản', 'account', 'password', 'mật khẩu'],
      
      // Technical issues
      error: ['lỗi', 'error', 'vấn đề', 'problem', 'sự cố', 'issue'],
      
      // Navigation
      navigation: ['đi đến', 'vào', 'mở', 'truy cập', 'navigate', 'access'],
      
      // Time and schedule
      time: ['thời gian', 'time', 'lịch', 'schedule', 'khi nào', 'when'],
      
      // Difficulty level
      difficulty: ['khó', 'dễ', 'difficulty', 'level', 'cấp độ'],
      
      // General questions
      what: ['cái gì', 'what is', 'là gì', 'what'],
      how: ['làm thế nào', 'how to', 'như thế nào', 'how'],
      where: ['ở đâu', 'where', 'đâu'],
      when: ['khi nào', 'when'],
      why: ['tại sao', 'why'],
      
      // Common phrases
      thanks: ['cảm ơn', 'thank', 'thanks'],
      bye: ['tạm biệt', 'bye', 'goodbye'],
      ok: ['ok', 'được', 'tốt', 'good']
    };
    
    // Check which pattern matches
    let matchedPattern = null;
    for (const [pattern, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        matchedPattern = pattern;
        break;
      }
    }
    
    // Personalized responses based on user role and pattern
    if (userContext.role === 'teacher') {
      if (matchedPattern === 'greeting') {
        return `Xin chào ${userContext.name || 'giáo viên'}! Tôi là trợ lý hỗ trợ. Tôi có thể giúp bạn về:\n• Tạo và quản lý bài thi\n• Xem kết quả học sinh\n• Quản lý lớp học\n• Hướng dẫn sử dụng hệ thống\n\nBạn cần giúp gì cụ thể không?`;
      } else if (matchedPattern === 'createExam') {
        return 'Để tạo bài thi mới:\n1. Vào mục "Khóa Học"\n2. Chọn lớp học muốn tạo bài thi\n3. Click "Tạo bài thi mới"\n4. Điền thông tin bài thi (tiêu đề, thời gian, môn học)\n5. Thêm câu hỏi và đáp án\n6. Lưu và xuất bản\n\nBạn muốn hướng dẫn chi tiết hơn về bước nào không?';
      } else if (matchedPattern === 'exam') {
        return 'Về bài thi:\n• Tạo bài thi: Khóa Học → Chọn lớp → Tạo bài thi mới\n• Quản lý bài thi: Xem, sửa, xóa bài thi đã tạo\n• Xem bài nộp: Kiểm tra kết quả học sinh\n• Thống kê: Xem báo cáo và phân tích\n\nBạn cần giúp gì về quản lý bài thi?';
      } else if (matchedPattern === 'examResult') {
        return 'Để xem kết quả học sinh:\n1. Vào trang Lớp học\n2. Chọn tab "Bài nộp"\n3. Xem điểm và thống kê của tất cả học sinh\n4. Có thể xuất báo cáo Excel\n\nBạn cũng có thể xem thống kê tổng quan trong Dashboard.';
      } else if (matchedPattern === 'class') {
        return 'Về quản lý lớp học:\n• Tạo lớp: Khóa Học → Tạo lớp mới\n• Thêm học sinh: Lớp học → Thêm học sinh\n• Xem bài nộp: Kiểm tra tiến độ\n• Quản lý: Cài đặt, thống kê\n\nBạn đang muốn làm gì với lớp học?';
      } else if (matchedPattern === 'help') {
        return `Chào ${userContext.name || 'giáo viên'}! Tôi có thể giúp bạn về:\n\n📚 **Quản lý học tập:**\n• Tạo và quản lý bài thi\n• Xem kết quả và thống kê học sinh\n• Quản lý lớp học và học sinh\n• Xuất báo cáo\n\n🔧 **Kỹ thuật:**\n• Hướng dẫn sử dụng hệ thống\n• Báo cáo lỗi và sự cố\n• Quản lý tài khoản\n\nBạn cần giúp đỡ về vấn đề gì cụ thể?`;
      } else if (matchedPattern === 'account') {
        return 'Về tài khoản giáo viên:\n• Đăng nhập: Sử dụng username và password\n• Quên mật khẩu: Liên hệ admin để reset\n• Thay đổi thông tin: Vào trang Profile\n• Cài đặt: Tùy chỉnh thông tin cá nhân\n\nBạn gặp vấn đề gì về tài khoản?';
      } else if (matchedPattern === 'error') {
        return 'Nếu bạn gặp lỗi:\n1. F5 tải lại trang\n2. Kiểm tra kết nối internet\n3. Xóa cache trình duyệt (Ctrl+Shift+Delete)\n4. Đăng nhập lại\n5. Liên hệ admin nếu vẫn không được\n\nBạn đang gặp lỗi gì? Có thể mô tả chi tiết hơn không?';
      } else if (matchedPattern === 'navigation') {
        const currentPage = userContext.currentPage;
        return `Bạn đang ở trang: ${currentPage}\n\nCác trang chính:\n• Dashboard: Trang tổng quan\n• Khóa Học: Quản lý lớp và bài thi\n• Lớp học: Chi tiết lớp học\n• Profile: Thông tin cá nhân\n\nBạn muốn đi đến trang nào?`;
      } else if (matchedPattern === 'thanks') {
        return `Rất vui được giúp ${userContext.name || 'bạn'}! Nếu có câu hỏi nào khác, đừng ngần ngại hỏi nhé.`;
      } else if (matchedPattern === 'bye') {
        return `Chào tạm biệt ${userContext.name || 'giáo viên'}! Chúc bạn một ngày làm việc hiệu quả!`;
      }
    } else if (userContext.role === 'student') {
      if (matchedPattern === 'greeting') {
        return `Xin chào ${userContext.name || 'bạn'}! Tôi là trợ lý học tập. Tôi có thể giúp bạn:\n• Làm bài thi và xem kết quả\n• Xem lịch học và bài tập\n• Hướng dẫn sử dụng hệ thống\n• Giải đáp thắc mắc học tập\n\nBạn cần giúp gì hôm nay?`;
      } else if (matchedPattern === 'exam') {
        return 'Để làm bài thi:\n1. Vào mục "Khóa Học"\n2. Chọn bài thi muốn làm\n3. Click "Bắt đầu làm bài"\n4. Đọc kỹ hướng dẫn và thời gian\n5. Trả lời các câu hỏi\n6. Kiểm tra lại và nộp bài\n\nChúc bạn làm bài tốt!';
      } else if (matchedPattern === 'examResult') {
        return 'Để xem điểm thi của bạn:\n1. Vào trang Dashboard\n2. Xem mục "Kết quả thi gần đây"\n3. Hoặc vào trang Lớp học → tab "Bài nộp"\n\nBạn có thể xem chi tiết điểm, số câu đúng và tỷ lệ phần trăm.';
      } else if (matchedPattern === 'class') {
        return 'Về lớp học của bạn:\n• Xem thông tin: Lớp học → Chi tiết lớp\n• Làm bài thi: Khóa Học → Chọn bài thi\n• Xem điểm: Dashboard hoặc Lớp học\n• Lịch học: Xem trong trang Lớp học\n\nBạn muốn biết thêm về tính năng nào?';
      } else if (matchedPattern === 'help') {
        return `Chào ${userContext.name || 'bạn'}! Tôi có thể giúp bạn về:\n\n📚 **Học tập:**\n• Làm bài thi và xem kết quả\n• Xem lịch học và bài tập\n• Theo dõi tiến độ học tập\n\n🔧 **Kỹ thuật:**\n• Hướng dẫn sử dụng hệ thống\n• Báo cáo lỗi và sự cố\n• Quản lý tài khoản\n\nBạn cần giúp đỡ về vấn đề gì cụ thể?`;
      } else if (matchedPattern === 'account') {
        return 'Về tài khoản học sinh:\n• Đăng nhập: Sử dụng username và password từ giáo viên\n• Quên mật khẩu: Liên hệ giáo viên để reset\n• Thay đổi thông tin: Vào trang Profile\n• Avatar: Cập nhật ảnh đại diện\n\nBạn gặp vấn đề gì về tài khoản?';
      } else if (matchedPattern === 'error') {
        return 'Nếu bạn gặp lỗi:\n1. F5 tải lại trang\n2. Kiểm tra kết nối internet\n3. Xóa cache trình duyệt (Ctrl+Shift+Delete)\n4. Đăng nhập lại\n5. Liên hệ giáo viên nếu vẫn không được\n\nBạn đang gặp lỗi gì? Có thể mô tả chi tiết hơn không?';
      } else if (matchedPattern === 'navigation') {
        const currentPage = userContext.currentPage;
        return `Bạn đang ở trang: ${currentPage}\n\nCác trang chính:\n• Dashboard: Trang tổng quan và kết quả\n• Khóa Học: Danh sách lớp và bài thi\n• Lớp học: Chi tiết lớp học\n• Profile: Thông tin cá nhân\n\nBạn muốn đi đến trang nào?`;
      } else if (matchedPattern === 'thanks') {
        return `Không có gì ${userContext.name || 'bạn'}! Học tốt nhé! Nếu cần giúp gì thêm, cứ hỏi tôi.`;
      } else if (matchedPattern === 'bye') {
        return `Chào tạm biệt ${userContext.name || 'bạn'}! Chúc bạn học tập tốt và đạt kết quả cao!`;
      }
    }
    
    // General responses for all users
    if (matchedPattern === 'what') {
      return 'Để tôi hiểu rõ hơn, bạn có thể cho biết:\n• Bạn đang hỏi về tính năng nào?\n• Bạn đang gặp vấn đề gì?\n• Bạn cần hướng dẫn về điều gì?\n\nCố gắng mô tả chi tiết hơn để tôi giúp bạn tốt hơn nhé!';
    } else if (matchedPattern === 'how') {
      return 'Để hướng dẫn bạn tốt nhất, tôi cần biết:\n• Bạn muốn làm gì cụ thể?\n• Bạn đang ở trang nào?\n• Bạn đã thử cách nào chưa?\n\nHãy mô tả chi tiết hơn về việc bạn cần làm!';
    } else if (matchedPattern === 'time') {
      return 'Về thời gian:\n• Thời gian làm bài: Được hiển thị trong mỗi bài thi\n• Lịch học: Xem trong trang Lớp học\n• Hạn nộp bài: Kiểm tra trong từng bài thi\n\nBạn cần thông tin thời gian về việc gì cụ thể?';
    } else if (matchedPattern === 'difficulty') {
      return 'Về độ khó:\n• Các bài thi có độ khó khác nhau\n• Xem mô tả trong từng bài thi\n• Giáo viên có thể tùy chỉnh độ khó\n\nBạn cảm thấy bài thi nào quá khó hoặc quá dễ?';
    } else if (matchedPattern === 'thanks') {
      return 'Rất vui được giúp bạn! Nếu có câu hỏi nào khác, đừng ngần ngại hỏi nhé.';
    } else if (matchedPattern === 'bye') {
      return 'Chào tạm biệt! Chúc bạn một ngày tốt lành!';
    } else if (matchedPattern === 'ok') {
      return 'Tuyệt vời! Bạn còn cần giúp gì thêm không?';
    }
    
    // Default enhanced response
    return `Tôi hiểu câu hỏi của bạn, ${userContext.name || 'bạn'}! Để giúp bạn tốt hơn:\n\n💡 **Gợi ý:**\n• Hỏi về: "làm bài thi", "xem điểm", "lớp học", "help"\n• Mô tả chi tiết vấn đề bạn gặp\n• Nêu rõ trang bạn đang ở\n\n📍 **Vị trí hiện tại:** ${userContext.currentPage}\n👤 **Vai trò:** ${userContext.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}\n\nBạn có thể thử hỏi lại với từ khóa rõ ràng hơn không?`;
  }
}

export const chatbotService = new ChatbotService();
