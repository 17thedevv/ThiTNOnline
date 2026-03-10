import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import NotificationBox from "./NotificationBox";
import "./Topbar.css";
import defaultAvatar from "../assets/images/steve.jpg";
import { useAuth } from "../contexts/AuthContext";
import { logout as apiLogout } from "../api/auth";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.username || user?.name || "Người dùng";

  const handleLogout = () => {
    apiLogout();
    logout();
    navigate("/login");
  };

  return (
    <div className="topbar">
      {/* 🔔 Notification */}
      <div className="notify-wrapper">
        <button
          className="notify-btn"
          onClick={() => setShowNotify(!showNotify)}
        >
          <FaBell />
          <span className="notify-count">3</span>
        </button>

        {showNotify && (
          <div className="notify-dropdown">
            <NotificationBox />
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