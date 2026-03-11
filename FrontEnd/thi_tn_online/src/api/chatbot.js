import { apiClient } from './client';

export const chatbotService = {
  // Gửi tin nhắn đến chatbot
  sendMessage: async (message, conversationId = null, context = {}) => {
    const response = await apiClient.post('/api/chatbot/chat/', {
      message,
      conversation_id: conversationId,
      context
    });
    return response.data;
  },

  // Quick reply
  quickReply: async (message, conversationId) => {
    const response = await apiClient.post('/api/chatbot/quick-reply/', {
      message,
      conversation_id: conversationId
    });
    return response.data;
  },

  // Lấy danh sách cuộc trò chuyện
  getConversations: async () => {
    const response = await apiClient.get('/api/chatbot/conversations/');
    return response.data;
  },

  // Tạo cuộc trò chuyện mới
  createConversation: async (title = null, context = {}) => {
    const response = await apiClient.post('/api/chatbot/conversations/', {
      title,
      context
    });
    return response.data;
  },

  // Lấy chi tiết cuộc trò chuyện
  getConversation: async (conversationId) => {
    const response = await apiClient.get(`/api/chatbot/conversations/${conversationId}/`);
    return response.data;
  },

  // Cập nhật cuộc trò chuyện
  updateConversation: async (conversationId, data) => {
    const response = await apiClient.put(`/api/chatbot/conversations/${conversationId}/`, data);
    return response.data;
  },

  // Xóa cuộc trò chuyện
  deleteConversation: async (conversationId) => {
    await apiClient.delete(`/api/chatbot/conversations/${conversationId}/`);
  },

  // Lấy tin nhắn của cuộc trò chuyện
  getMessages: async (conversationId) => {
    const response = await apiClient.get(`/api/chatbot/conversations/${conversationId}/messages/`);
    return response.data;
  },

  // Lấy thống kê (admin/teacher)
  getStats: async () => {
    const response = await apiClient.get('/api/chatbot/stats/');
    return response.data;
  },

  // Quản lý responses (admin)
  getResponses: async () => {
    const response = await apiClient.get('/api/chatbot/responses/');
    return response.data;
  },

  createResponse: async (data) => {
    const response = await apiClient.post('/api/chatbot/responses/', data);
    return response.data;
  },

  updateResponse: async (id, data) => {
    const response = await apiClient.put(`/api/chatbot/responses/${id}/`, data);
    return response.data;
  },

  deleteResponse: async (id) => {
    await apiClient.delete(`/api/chatbot/responses/${id}/`);
  }
};
