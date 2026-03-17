import { NavLink, Outlet } from "react-router-dom";
import { FaBook, FaHome } from "react-icons/fa";
import TopBar from "../components/Topbar";
import "./PrivateLayout.css";
import logo from "../assets/images/gdht.jpg";


const PrivateLayout = () => {
  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Thi Trắc Nghiệm Online" />
          <h2>Thi Trắc Nghiệm Online</h2>
        </div>

        <nav className="sidebar-menu">
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
