import "./Login.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMe, login as loginApi } from "../../api/auth";
import { FaUser, FaLock, FaGoogle, FaMicrosoft, FaQrcode, FaGraduationCap, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Add entrance animation
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
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

  const handleSocialLogin = (provider) => {
    // Handle social login logic here
    console.log(`Login with ${provider}`);
  };

  if (isLoading) {
    return (
      <div className="login-loading">
        <div className="loading-spinner">
          <FaGraduationCap className="spinner-icon" />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <FaGraduationCap className="logo-icon" />
            </div>
            <h1 className="login-title">Chào mừng trở lại</h1>
            <p className="login-subtitle">Đăng nhập vào tài khoản ThiTNOnline của bạn</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Email, tên đăng nhập hoặc số điện thoại"
                className="login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <div
                className="forgot-password"
                onClick={() => navigate("/forgot-password")}
              >
                Quên mật khẩu?
              </div>
            </div>

            <button 
              type="submit"
              className="login-btn" 
              disabled={isSubmitting || !username || !password}
            >
              {isSubmitting ? (
                <div className="btn-spinner">
                  <div className="spinner"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>Hoặc tiếp tục với</span>
          </div>

          <div className="login-social">
            <button 
              className="social-btn google"
              onClick={() => handleSocialLogin('google')}
            >
              Google
            </button>
            <button 
              className="social-btn microsoft"
              onClick={() => handleSocialLogin('microsoft')}
            >
              Microsoft
            </button>
            <button 
              className="social-btn qrcode"
              onClick={() => handleSocialLogin('qrcode')}
            >
              QR Code
            </button>
          </div>

          <div className="login-register">
            Chưa có tài khoản?{" "}
            <span className="register-link" onClick={() => navigate("/register")}>
              Đăng ký ngay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
