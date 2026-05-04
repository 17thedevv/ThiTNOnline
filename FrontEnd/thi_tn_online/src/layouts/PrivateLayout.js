import { NavLink, Outlet } from "react-router-dom";
import { FaBook, FaHome, FaChartBar, FaShieldAlt, FaDatabase, FaClipboardList } from "react-icons/fa";
import TopBar from "../components/Topbar";
import "./PrivateLayout.css";
import logo from "../assets/images/gdht.jpg";
import { useAuth } from "../contexts/AuthContext";


const PrivateLayout = () => {
  const { user } = useAuth();

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Thi Trắc Nghiệm Online" />
          <h2>Thi Trắc Nghiệm Online</h2>
        </div>

        <nav className="sidebar-menu">
          {user?.role !== "admin" && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => isActive ? "menu-item active" : "menu-item"
                }
              >
                <FaHome className="menu-icon" />
                <span>Trang chủ</span>
              </NavLink>
              <NavLink
                to="/classes"
                className={({ isActive }) =>
                  isActive ? "menu-item active" : "menu-item"
                }
              >
                <FaBook className="menu-icon" />
                <span>Lớp học</span>
              </NavLink>
              {user?.role === "student" && (
                <NavLink
                  to="/profile/submissions"
                  className={({ isActive }) =>
                    isActive ? "menu-item active" : "menu-item"
                  }
                >
                  <FaClipboardList className="menu-icon" />
                  <span>Lịch sử làm bài</span>
                </NavLink>
              )}
            </>
          )}
          <NavLink
            to="/statistics"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaChartBar className="menu-icon" />
            <span>{user?.role === "admin" ? "Thống kê hệ thống" : "Thống kê"}</span>
          </NavLink>
          {user?.role === "teacher" && (
            <>
              <NavLink
                to="/subjects"
                className={({ isActive }) =>
                  isActive ? "menu-item active" : "menu-item"
                }
              >
                <FaBook className="menu-icon" />
                <span>Môn học</span>
              </NavLink>
              <NavLink
                to="/question-bank"
                className={({ isActive }) =>
                  isActive ? "menu-item active" : "menu-item"
                }
              >
                <FaDatabase className="menu-icon" />
                <span>Ngân hàng câu hỏi</span>
              </NavLink>
            </>
          )}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                window.location.pathname.startsWith("/admin") ? "menu-item active" : "menu-item"
              }
            >
              <FaShieldAlt className="menu-icon" />
              <span>Quản trị</span>
            </NavLink>
          )}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="main-wrapper">
        <TopBar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
