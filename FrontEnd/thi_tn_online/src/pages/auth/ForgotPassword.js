import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../../api/auth";
import "./Auth.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!username) {
      setError("Vui lòng nhập tên đăng nhập");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await forgotPassword(username);
      setSuccess(res.message || "Mã xác nhận đã được gửi đến email đăng ký của bạn.");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword) {
      setError("Vui lòng nhập mã xác nhận và mật khẩu mới");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword(username, code, newPassword);
      setSuccess("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Mã xác nhận không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Quên mật khẩu</h2>

        {error && <div className="error-message" style={{ color: "red", fontSize: "14px", marginBottom: "15px" }}>{error}</div>}
        {success && <div className="success-message" style={{ color: "green", fontSize: "14px", marginBottom: "15px" }}>{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
              Nhập tên đăng nhập để nhận liên kết đặt lại mật khẩu qua email
            </p>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
              Nhập mã gồm 6 chữ số đã gửi đến email của bạn và mật khẩu mới.
            </p>
            <input
              type="text"
              placeholder="Mã xác nhận 6 số"
              className="login-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              maxLength={6}
            />
            <input
              type="password"
              placeholder="Mật khẩu mới (ít nhất 8 ký tự)"
              className="login-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}

        <div className="login-register" style={{ marginTop: "16px" }}>
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
