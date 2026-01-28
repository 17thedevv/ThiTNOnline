import { Link } from "react-router-dom";
import "./Auth.css";

const ForgotPassword = () => {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Quên mật khẩu</h2>

        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
          Nhập email để nhận liên kết đặt lại mật khẩu
        </p>

        <input
          type="email"
          placeholder="Email đăng ký"
          className="login-input"
        />

        <button className="login-btn">
          Gửi yêu cầu
        </button>

        <div className="login-register">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
