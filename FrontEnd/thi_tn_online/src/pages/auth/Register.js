import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../../api/auth";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaGraduationCap, 
  FaEye, 
  FaEyeSlash,
  FaChalkboardTeacher,
  FaUserGraduate
} from "react-icons/fa";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Vui lòng nhập tên tài khoản");
      return false;
    }
    
    if (formData.username.length < 3) {
      setError("Tên tài khoản phải có ít nhất 3 ký tự");
      return false;
    }
    
    if (!formData.email.trim()) {
      setError("Vui lòng nhập email");
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError("Email không hợp lệ");
      return false;
    }
    
    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu");
      return false;
    }
    
    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await registerApi({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      
      setSuccess("Đăng ký thành công! Đang chuyển sang trang đăng nhập...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.first_name?.[0] ||
        data?.last_name?.[0] ||
        data?.detail ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'teacher':
        return <FaChalkboardTeacher />;
      case 'student':
        return <FaUserGraduate />;
      default:
        return <FaUser />;
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'teacher':
        return 'Giáo viên';
      case 'student':
        return 'Học sinh';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="register-loading">
        <div className="loading-spinner">
          <FaGraduationCap className="spinner-icon" />
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">
              <FaGraduationCap className="logo-icon" />
            </div>
            <h1 className="register-title">Đăng ký tài khoản</h1>
            <p className="register-subtitle">Tạo tài khoản ThiTNOnline của bạn</p>
          </div>

          <form className="register-form" onSubmit={handleRegister}>
            {/* Role Selection */}
            <div className="role-selection">
              <label className="role-label">Bạn là:</label>
              <div className="role-options">
                <div 
                  className={`role-option ${formData.role === 'student' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                >
                  <FaUserGraduate />
                  <span>Học sinh</span>
                </div>
                <div 
                  className={`role-option ${formData.role === 'teacher' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                >
                  <FaChalkboardTeacher />
                  <span>Giáo viên</span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="form-section">
              <h3>Thông tin cá nhân</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Tên tài khoản</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Nhập tên tài khoản"
                    className="register-input"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  <small>Tên tài khoản sẽ được dùng để đăng nhập</small>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email của bạn"
                    className="register-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Họ</label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Nhập họ của bạn"
                    className="register-input"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Tên</label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Nhập tên của bạn"
                    className="register-input"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="form-section">
              <h3>Mật khẩu</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="password-input">
                    <input
                      type={showPasswords.password ? "text" : "password"}
                      name="password"
                      placeholder="Nhập mật khẩu"
                      className="register-input"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      {showPasswords.password ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <small>Mật khẩu phải có ít nhất 8 ký tự</small>
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="password-input">
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      className="register-input"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="register-error">{error}</div>}
            {success && <div className="register-success">{success}</div>}

            <button 
              type="submit"
              className="register-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="btn-spinner">
                  <div className="spinner"></div>
                  Đang đăng ký...
                </div>
              ) : (
                "Đăng ký tài khoản"
              )}
            </button>
          </form>

          <div className="register-login">
            Đã có tài khoản?{" "}
            <span className="login-link" onClick={() => navigate("/login")}>
              Đăng nhập ngay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
