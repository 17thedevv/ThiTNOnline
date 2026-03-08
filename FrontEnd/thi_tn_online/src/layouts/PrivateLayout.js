import { NavLink, Outlet, Link } from "react-router-dom";
import { FaBook, FaClipboardList, FaHome } from "react-icons/fa";
import TopBar from "../components/Topbar";
import ChatBot from "../components/Chatbot";
import "./PrivateLayout.css";
import logo from "../assets/images/gdht.jpg";


const PrivateLayout = () => {
  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link to="/dashboard">
          <img src={logo} alt="Thi Online" />
          <span>Thi Online</span>
          </Link>
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

          <NavLink
            to="/exams"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaClipboardList className="menu-icon" />
            <span>Khóa Học</span>
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
      <ChatBot />
    </div>
  );
};

export default PrivateLayout;
