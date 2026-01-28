import { Link } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Đăng ký tài khoản</h2>

        <input
          type="text"
          placeholder="Họ và tên"
          className="login-input"
        />

        <input
          type="email"
          placeholder="Email"
          className="login-input"
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="login-input"
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="login-input"
        />

        <button className="login-btn">
          Đăng ký
        </button>

        <div className="login-register">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
