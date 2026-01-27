import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";

import "./PublicLayout.css";

const PublicLayout = () => {
  return (
    <>
      <header className="public-header">
        <div className="logo">Nền Tảng Thi Trắc Nghiệm Online</div>
        <Link to="/login" className="login-link">Đăng nhập</Link>
      </header>

      <Outlet />
    </>
  );
};

export default PublicLayout;
