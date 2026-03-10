import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { listClasses } from "../../api/classes";
import { listSubmissions } from "../../api/submissions";
import { listExams } from "../../api/exams";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [clsRes, subsRes, exsRes] = await Promise.allSettled([
        listClasses(),
        listSubmissions(),
        listExams(),
      ]);

      if (!mounted) return;

      if (clsRes.status === "fulfilled") {
        setClasses(clsRes.value || []);
      } else {
        console.error("Không tải được danh sách lớp:", clsRes.reason);
      }

      if (subsRes.status === "fulfilled") {
        setSubmissions(subsRes.value || []);
      } else {
        console.error("Không tải được danh sách bài nộp:", subsRes.reason);
      }

      if (exsRes.status === "fulfilled") {
        setExams(exsRes.value || []);
      } else {
        console.error("Không tải được danh sách đề thi:", exsRes.reason);
      }

      if (
        clsRes.status === "rejected" &&
        subsRes.status === "rejected" &&
        exsRes.status === "rejected"
      ) {
        setError("Không tải được dữ liệu tổng quan. Vui lòng thử lại sau.");
      } else {
        setError("");
      }

      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const role = user?.role;
  const isTeacherLike = role === "teacher" || role === "admin";

  const stats = useMemo(() => {
    const classCount = classes.length;
    const examDone = submissions.length;
    const avgScore =
      submissions.length > 0
        ? (
            submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
            submissions.length
          ).toFixed(2)
        : 0;
    const examCreated = exams.length;

    return { classCount, examDone, avgScore, examCreated };
  }, [classes, submissions, exams]);

  const recentClasses = classes.slice(0, 4);
  const recentSubmissions = submissions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.submitted_at || 0).getTime() -
        new Date(a.submitted_at || 0).getTime()
    )
    .slice(0, 4);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Xin chào, {user?.username || user?.name}</h2>
        <p>Chúc bạn học tập hiệu quả hôm nay 🚀</p>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu tổng quan...</p>
      ) : error ? (
        <p style={{ color: "#dc2626" }}>{error}</p>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>{stats.classCount}</h3>
              <p>{isTeacherLike ? "Lớp đang dạy" : "Lớp đã tham gia"}</p>
            </div>
            <div className="stat-card">
              <h3>{isTeacherLike ? stats.examCreated : stats.examDone}</h3>
              <p>{isTeacherLike ? "Đề đã tạo" : "Đề đã làm"}</p>
            </div>
            <div className="stat-card">
              <h3>{stats.avgScore}</h3>
              <p>{isTeacherLike ? "Điểm TB học sinh" : "Điểm trung bình"}</p>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-left">
              <h3>📚 Lớp truy cập gần đây</h3>
              {recentClasses.length === 0 ? (
                <p>
                  {isTeacherLike
                    ? "Bạn chưa tạo lớp nào."
                    : "Bạn chưa tham gia lớp nào."}
                </p>
              ) : (
                recentClasses.map((cls) => (
                  <div key={cls.id} className="class-card">
                    <h4>{cls.name}</h4>
                  </div>
                ))
              )}
            </div>

            <div className="dashboard-right">
              <h3>
                {isTeacherLike ? "📝 Bài nộp gần đây" : "📝 Đề thi đã làm gần đây"}
              </h3>
              {recentSubmissions.length === 0 ? (
                <p>
                  {isTeacherLike
                    ? "Chưa có học sinh nộp bài."
                    : "Bạn chưa làm đề thi nào."}
                </p>
              ) : (
                recentSubmissions.map((sub) => (
                  <div key={sub.id} className="exam-card">
                    <h4>Đề #{sub.exam}</h4>
                    <p>{isTeacherLike ? `Học sinh #${sub.student}` : ""}</p>
                    <p>Điểm: {sub.score}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
