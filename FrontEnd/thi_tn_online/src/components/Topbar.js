import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";
import defaultAvatar from "../assets/images/steve.jpg";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const user = {
    name: "17thedev",
    avatar: defaultAvatar,
  };

  return (
    <div className="topbar">
      <div
        className="profile"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <img src={user.avatar} alt="avatar" />
        <span>{user.name}</span>

        {open && (
          <div className="dropdown">
            <div onClick={() => navigate("/profile")}>Hồ sơ</div>
            <div onClick={() => navigate("/login")}>Đăng xuất</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
