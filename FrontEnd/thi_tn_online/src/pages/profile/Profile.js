import "./Profile.css";
import defaultAvatar from "../../assets/images/steve.jpg";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  const displayName = user?.username || "Người dùng";
  const email = user?.email || "Chưa cập nhật";
  const roleLabel =
    user?.role === "teacher"
      ? "Giáo viên"
      : user?.role === "student"
      ? "Học sinh"
      : user?.role === "admin"
      ? "Quản trị viên"
      : "Chưa xác định";

  return (
    <div className="profile-page">
      <div className="profile-left">
        <h2>Hồ sơ cá nhân</h2>
        <p>Thông tin tài khoản và vai trò của bạn trong hệ thống.</p>
      </div>

      <div className="profile-right">
        <div className="profile-card">
          <img src={defaultAvatar} alt="avatar" className="profile-avatar" />

          <h3 className="profile-name">{displayName}</h3>

          <span className="profile-role-badge">{roleLabel}</span>

          <div className="profile-info">
            <p>
              <strong>Email:</strong> {email}
            </p>
            <p>
              <strong>Mã người dùng:</strong> {user?.id ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

