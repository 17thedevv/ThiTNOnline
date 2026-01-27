import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={{
      width: 220,
      background: "#f5f5f5",
      minHeight: "calc(100vh - 60px)",
      padding: 20
    }}>
      <p><Link to="/">Dashboard</Link></p>
      <p><Link to="/classes">Lớp học</Link></p>
      <p><Link to="/assignments">Bài tập</Link></p>
      <p><Link to="/profile">Hồ sơ</Link></p>
    </div>
  );
};

export default Sidebar;
