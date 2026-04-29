import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaUsers, FaBook, FaChalkboardTeacher, FaFileAlt,
  FaChartLine, FaShieldAlt, FaTrophy, FaArrowRight
} from "react-icons/fa";
import { getGeneralStatistics } from "../../api/admin";
import "./AdminDashboard.css";

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className={`admin-stat-card admin-stat-card--${color}`}>
    <div className="admin-stat-icon">
      <Icon />
    </div>
    <div className="admin-stat-info">
      <span className="admin-stat-value">{value ?? "—"}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
    {trend && <div className="admin-stat-trend">{trend}</div>}
  </div>
);

const QuickLink = ({ to, icon: Icon, label, desc, color }) => (
  <NavLink to={to} className={`admin-quick-link admin-quick-link--${color}`}>
    <div className="admin-quick-icon"><Icon /></div>
    <div className="admin-quick-text">
      <span className="admin-quick-label">{label}</span>
      <span className="admin-quick-desc">{desc}</span>
    </div>
    <FaArrowRight className="admin-quick-arrow" />
  </NavLink>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGeneralStatistics()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-dash-header">
        <div className="admin-dash-header-icon">
          <FaShieldAlt />
        </div>
        <div>
          <h1 className="admin-dash-title">Bảng điều khiển quản trị</h1>
          <p className="admin-dash-subtitle">Tổng quan hệ thống Thi Trắc Nghiệm Online</p>
        </div>
      </div>

      {/* STATS GRID */}
      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <div className="admin-stats-grid">
          <StatCard icon={FaUsers} label="Sinh viên" value={stats?.total_students} color="blue" />
          <StatCard icon={FaChalkboardTeacher} label="Giảng viên" value={stats?.total_teachers} color="purple" />
          <StatCard icon={FaFileAlt} label="Bài thi" value={stats?.total_exams} color="orange" />
          <StatCard icon={FaTrophy} label="Lượt nộp bài" value={stats?.total_submissions} color="green" />
          <StatCard
            icon={FaChartLine}
            label="Điểm trung bình"
            value={stats?.average_score ? `${stats.average_score}/10` : "—"}
            color="teal"
          />
        </div>
      )}

      {/* QUICK LINKS */}
      <div className="admin-section">
        <h2 className="admin-section-title">Quản lý nhanh</h2>
        <div className="admin-quick-grid">
          <QuickLink
            to="/admin/users"
            icon={FaUsers}
            label="Quản lý người dùng"
            desc="Xem, sửa, xóa tài khoản"
            color="blue"
          />
          <QuickLink
            to="/admin/subjects"
            icon={FaBook}
            label="Quản lý môn học"
            desc="Thêm, sửa, xóa môn học"
            color="purple"
          />
          <QuickLink
            to="/admin/exams"
            icon={FaFileAlt}
            label="Quản lý bài thi"
            desc="Xem tất cả bài thi"
            color="orange"
          />
          <QuickLink
            to="/admin/classes"
            icon={FaChalkboardTeacher}
            label="Quản lý lớp học"
            desc="Xem và loại bỏ lớp"
            color="teal"
          />
          <QuickLink
            to="/statistics"
            icon={FaChartLine}
            label="Thống kê chi tiết"
            desc="Biểu đồ và báo cáo"
            color="green"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
