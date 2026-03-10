import "./Login.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getMe, login as loginApi } from "../../api/auth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await loginApi({ username, password });
      const me = await getMe();
      login(me);
      navigate("/dashboard");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.non_field_errors?.[0] ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Đăng nhập</h2>

        <input
          type="text"
          placeholder="Nhập số điện thoại, email hoặc username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? <div className="login-error">{error}</div> : null}

        {/* QUÊN MẬT KHẨU */}
        <div
          className="login-forgot"
          onClick={() => navigate("/forgot-password")}
        >
          Quên mật khẩu?
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
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
