import { useAuth } from "../../contexts/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="dashboard-header">
        <h2>Xin chào, {user?.name}</h2>
        <p>Chúc bạn học tập hiệu quả hôm nay</p>
      </div>
    </div>
  );
};

export default Dashboard;

