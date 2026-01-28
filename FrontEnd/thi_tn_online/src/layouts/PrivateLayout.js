import { NavLink, Outlet } from "react-router-dom";
import { FaBook, FaClipboardList } from "react-icons/fa";
import TopBar from "../components/Topbar";
import "./PrivateLayout.css";
import logo from "../assets/images/gdht.jpg";

const PrivateLayout = () => {
  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Thi Online" />
          <span>Thi Online</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/classes"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaBook className="menu-icon" />
            <span>Lớp học</span>
          </NavLink>

          <NavLink
            to="/exams"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaClipboardList className="menu-icon" />
            <span>Bài trắc nghiệm</span>
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
