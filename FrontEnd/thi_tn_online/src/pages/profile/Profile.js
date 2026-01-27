import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Profile.css";
import defaultAvatar from "../../assets/images/steve.jpg";

const Profile = () => {
  const location = useLocation();
  const [showInfo, setShowInfo] = useState(true);

  // 🔑 MỖI LẦN VÀO /profile → reset lại
  useEffect(() => {
    setShowInfo(true);
  }, [location.pathname]);

  const user = {
    name: "17thedev",
    email: "17thedev@gmail.com",
    avatar: defaultAvatar,
    joinedAt: "01/2026",
  };

  return (
    <div className="profile-page">
      <div className="profile-left">
        <h2>Hồ sơ cá nhân</h2>
        <p>Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="profile-right">
        {showInfo && (
          <div className="profile-card">
            <img src={user.avatar} alt="avatar" className="profile-avatar" />

            <h3>{user.name}</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Tham gia từ:</strong> {user.joinedAt}</p>

            <div className="profile-actions">
              <button className="profile-btn">Chỉnh sửa hồ sơ</button>

              <button
                className="profile-btn outline"
                onClick={() => setShowInfo(false)}
              >
                Ẩn thông tin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

