import "./Login.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import h1 from "../../assets/images/h1.jpg";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // giả lập user
    login({
      id: 1,
      name: "17thedev",
      role: "student",
    });

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Đăng nhập</h2>

        <input
          type="text"
          placeholder="Nhập số điện thoại, email hoặc username"
          className="login-input"
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="login-input"
        />

        <div className="login-forgot">Quên mật khẩu?</div>

        <button className="login-btn" onClick={handleLogin}>
          Đăng nhập
        </button>

        <div className="login-register">
          Bạn chưa có tài khoản? <span>Tạo một tài khoản mới</span>
        </div>

        <div className="login-or">Hoặc</div>

        <div className="login-social">
          <button className="social-btn google">Google</button>
          <button className="social-btn microsoft">Microsoft</button>
          <button className="social-btn qrcode">QR code</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
