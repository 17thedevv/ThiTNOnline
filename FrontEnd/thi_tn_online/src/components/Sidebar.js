import "./Sidebar.css";
import logo from "../assets/images/gdht.jpg";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="logo" />
        <span>Thi Online</span>
      </div>

      <div className="sidebar-menu">
        <div className="menu-item active">Lớp học</div>
        <div className="menu-item">Bài kiểm tra</div>
      </div>
    </aside>
  );
};

export default Sidebar;
