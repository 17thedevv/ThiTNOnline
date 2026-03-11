import { useState, useEffect } from "react";
import { notificationService } from "../api/notifications";
import "./NotificationBox.css";

const NotificationBox = ({ onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true, is_new: false } : n
        )
      );
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, is_new: false }))
      );
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="notify-box">
        <h3 className="notify-title">🔔 Thông báo</h3>
        <div className="notify-loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="notify-box">
      <div className="notify-header">
        <h3 className="notify-title">🔔 Thông báo</h3>
        {notifications.length > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="notify-list">
        {notifications.length === 0 ? (
          <div className="notify-empty">Không có thông báo nào</div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`notify-item ${n.is_read ? 'read' : 'unread'}`}
              onClick={() => handleMarkAsRead(n.id)}
            >
              <div className="notify-content">
                <div className="notify-head">
                  <span className="notify-text">{n.title}</span>
                  {n.is_new && <span className="notify-badge">Mới</span>}
                </div>
                <p className="notify-desc">{n.message}</p>
                <span className="notify-time">{n.time_ago}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBox;