import { useAuth } from "../../contexts/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  // Fake data tạm thời (sau này call API)
  const recentClasses = [
    { id: 1, name: "Lớp 12A1", subject: "Toán" },
    { id: 2, name: "Lớp 11B2", subject: "Vật lý" },
  ];

  const upcomingExams = [
    { id: 1, title: "Đề giữa kỳ Toán", time: "45 phút" },
    { id: 2, title: "Kiểm tra 15p Lý", time: "15 phút" },
  ];

  return (
    <div className="dashboard">
      
      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Xin chào, {user?.name}</h2>
        <p>Chúc bạn học tập hiệu quả hôm nay 🚀</p>
      </div>

      {/* STATS */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>5</h3>
          <p>Lớp đã tham gia</p>
        </div>
        <div className="stat-card">
          <h3>12</h3>
          <p>Đề đã làm</p>
        </div>
        <div className="stat-card">
          <h3>8.5</h3>
          <p>Điểm trung bình</p>
        </div>
      </div>

      <div className="dashboard-content">
        
        {/* LEFT */}
        <div className="dashboard-left">
          <h3>📚 Lớp truy cập gần đây</h3>
          {recentClasses.map((cls) => (
            <div key={cls.id} className="class-card">
              <h4>{cls.name}</h4>
              <p>Môn: {cls.subject}</p>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="dashboard-right">
          <h3>📝 Đề thi sắp tới</h3>
          {upcomingExams.map((exam) => (
            <div key={exam.id} className="exam-card">
              <h4>{exam.title}</h4>
              <p>Thời gian: {exam.time}</p>
              <button>Làm bài</button>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;