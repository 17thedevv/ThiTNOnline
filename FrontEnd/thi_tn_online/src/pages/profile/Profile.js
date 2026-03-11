import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile, updateProfile, changePassword } from "../../api/profile";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaSave, 
  FaEye, 
  FaEyeSlash,
  FaSpinner,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserGraduate
} from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form states
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Check if user is authenticated before loading profile
    if (!user) {
      setError("Bạn cần đăng nhập để xem hồ sơ cá nhân");
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setFormData({
        email: data.email || "",
        full_name: data.full_name || "",
      });
    } catch (err) {
      console.error('Profile load error:', err);
      if (err?.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError("Không tải được thông tin hồ sơ");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Split full_name into first_name and last_name for backend
      const nameParts = formData.full_name.trim().split(' ');
      const updateData = {
        email: formData.email,
        first_name: nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '',
        last_name: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
      };
      
      const updatedProfile = await updateProfile(updateData);
      setProfile(updatedProfile);
      setSuccess("Cập nhật hồ sơ thành công!");
      
      // Update auth context if needed
      if (user) {
        login({ ...user, ...updatedProfile });
      }
    } catch (err) {
      console.error('Profile update error:', err);
      
      if (err?.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = err?.response?.data;
        
        if (typeof errorData === 'object' && errorData !== null) {
          // Handle validation errors
          const errorMessages = [];
          
          if (errorData.error) {
            errorMessages.push(errorData.error);
          }
          
          // Handle field-specific errors
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              errorMessages.push(...errorData[key]);
            } else if (typeof errorData[key] === 'string' && key !== 'error') {
              errorMessages.push(errorData[key]);
            }
          });
          
          setError(errorMessages.join('. ') || "Cập nhật hồ sơ thất bại");
        } else {
          setError(err?.response?.data?.detail || err?.message || "Cập nhật hồ sơ thất bại");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setError("");
    setSuccess("");

    try {
      await changePassword(passwordData);
      setSuccess("Đổi mật khẩu thành công!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Đổi mật khẩu thất bại");
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaGraduationCap />;
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
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giáo viên';
      case 'student':
        return 'Học sinh';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">
          <FaUser className="spinner-icon" />
          <p>Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-title">
          <h1>Hồ sơ cá nhân</h1>
          <p>Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="profile-content">
        {/* Profile Overview */}
        <div className="profile-overview">
          <div className="user-info">
            <h2>{profile?.display_name || profile?.username}</h2>
            <p className="username">@{profile?.username}</p>
            <div className="user-role">
              {getRoleIcon(profile?.role)}
              <span>{getRoleName(profile?.role)}</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="profile-sections">
          <div className="profile-section">
            <h3>Thông tin cá nhân</h3>
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FaUser /> Họ và tên
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSpinner className="fa-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Lưu thông tin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Password Change */}
          <div className="profile-section">
            <h3>Đổi mật khẩu</h3>
            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>
                  <FaLock /> Mật khẩu hiện tại
                </label>
                <div className="password-input">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaLock /> Mật khẩu mới
                </label>
                <div className="password-input">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <small>Mật khẩu phải có ít nhất 8 ký tự</small>
              </div>

              <div className="form-group">
                <label>
                  <FaLock /> Xác nhận mật khẩu mới
                </label>
                <div className="password-input">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-secondary" disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <div className="btn-spinner"></div>
                      Đang đổi mật khẩu...
                    </>
                  ) : (
                    <>
                      <FaLock /> Đổi mật khẩu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
