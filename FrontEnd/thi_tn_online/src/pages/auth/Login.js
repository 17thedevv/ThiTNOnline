import "./Login.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

        {/* QUÊN MẬT KHẨU */}
        <div
          className="login-forgot"
          onClick={() => navigate("/forgot-password")}
        >
          Quên mật khẩu?
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Đăng nhập
        </button>

        {/* ĐĂNG KÝ */}
        <div className="login-register">
          Bạn chưa có tài khoản?{" "}
          <span onClick={() => navigate("/register")}>
            Tạo một tài khoản mới
          </span>
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
