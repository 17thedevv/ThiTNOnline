import "./Sidebar.css";
import logo from "../assets/images/gdht.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaChalkboardTeacher, 
  FaHome, 
  FaUser,
  FaChartBar
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Trang chủ',
      icon: <FaHome />,
      path: '/dashboard'
    },
    {
      id: 'classes',
      label: 'Lớp học',
      icon: <FaChalkboardTeacher />,
      path: '/classes'
    },
    {
      id: 'profile',
      label: 'Hồ sơ',
      icon: <FaUser />,
      path: '/profile'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="logo" />
        <span>Thi Online</span>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
