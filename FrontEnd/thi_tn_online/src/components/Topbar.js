import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import NotificationBox from "./NotificationBox";
import "./Topbar.css";
import defaultAvatar from "../assets/images/steve.jpg";
import { useAuth } from "../contexts/AuthContext";
import { logout as apiLogout } from "../api/auth";
import { notificationService } from "../api/notifications";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.username || user?.name || "Người dùng";

  useEffect(() => {
    fetchNotificationCount();
    // Cập nhật số lượng thông báo mỗi 30 giây
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const data = await notificationService.getNotificationCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const handleLogout = () => {
    apiLogout();
    logout();
    navigate("/login");
  };

  const handleNotificationClick = () => {
    setShowNotify(!showNotify);
    if (!showNotify) {
      fetchNotificationCount();
    }
  };

  return (
    <div className="topbar">
      {/* 🔔 Notification */}
      <div className="notify-wrapper">
        <button
          className="notify-btn"
          onClick={handleNotificationClick}
        >
          <FaBell />
          {unreadCount > 0 && (
            <span className="notify-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {showNotify && (
          <div className="notify-dropdown">
            <NotificationBox 
              onClose={() => setShowNotify(false)}
              onNotificationRead={fetchNotificationCount}
            />
          </div>
        )}
      </div>

      {/* 👤 Profile */}
      <div
        className="profile"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img src={defaultAvatar} alt="avatar" />
        <span>{displayName}</span>

        {open && (
          <div className="dropdown">
            <div onClick={() => navigate("/profile")}>Hồ sơ</div>
            <div onClick={handleLogout}>Đăng xuất</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;