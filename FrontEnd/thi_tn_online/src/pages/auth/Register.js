import { Link } from "react-router-dom";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { register as registerApi } from "../../api/auth";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    if (!username || !password) {
      setError("Vui lòng nhập username và mật khẩu.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerApi({ username, password, email, role });
      setSuccess("Đăng ký thành công. Đang chuyển sang trang đăng nhập...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.detail ||
        "Đăng ký thất bại.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Đăng ký tài khoản</h2>

        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
          className="login-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Học sinh</option>
          <option value="teacher">Giáo viên</option>
        </select>

        <input
          type="password"
          placeholder="Mật khẩu"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="login-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error ? <div className="login-error">{error}</div> : null}
        {success ? <div className="login-success">{success}</div> : null}

        <button className="login-btn" onClick={handleRegister} disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <div className="login-register">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
