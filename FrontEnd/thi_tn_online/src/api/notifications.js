import { apiClient } from './client';

export const notificationService = {
  // Lấy danh sách thông báo
  getNotifications: async () => {
    const response = await apiClient.get('/api/notifications/');
    return response.data;
  },

  // Lấy số lượng thông báo chưa đọc
  getNotificationCount: async () => {
    const response = await apiClient.get('/api/notifications/count/');
    return response.data;
  },

  // Đánh dấu một thông báo là đã đọc
  markAsRead: async (notificationId) => {
    const response = await apiClient.post(`/api/notifications/${notificationId}/mark-read/`);
    return response.data;
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async () => {
    const response = await apiClient.post('/api/notifications/mark-all-read/');
    return response.data;
  },

  // Tạo thông báo mới (dùng cho admin/teacher)
  createNotification: async (data) => {
    const response = await apiClient.post('/api/notifications/create/', data);
    return response.data;
  }
};
