import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Exams.css";
import { listExams } from "../../api/exams";
import { useAuth } from "../../contexts/AuthContext";

const Exams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const isTeacherLike = role === "teacher" || role === "admin";

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const data = await listExams();
        if (!mounted) return;
        setExams(data || []);
      } catch (e) {
        if (!mounted) return;
        setError(
          e?.response?.data?.detail ||
            "Không tải được danh sách đề thi. Vui lòng thử lại."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="exams-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>Bài trắc nghiệm</h2>
        {isTeacherLike && (
          <button
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              background: "#ec4899",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
            onClick={() =>
              navigate(`/exams/create`, { state: { classId: null } })
            }
          >
            + Tạo đề thi
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: "#dc2626", marginBottom: 12 }}>{error}</p>
      )}

      {loading ? (
        <p>Đang tải danh sách đề thi...</p>
      ) : (
        <div className="exam-list">
          {exams.length === 0 ? (
            <p>
              {isTeacherLike
                ? "Bạn chưa tạo đề thi nào."
                : "Chưa có đề thi nào."}
            </p>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="exam-card">
                <div className="exam-info">
                  <h3>{exam.title}</h3>
                  <p>Thời gian: {exam.duration} phút</p>
                  {isTeacherLike && (
                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                      {exam.max_attempts
                        ? `Giới hạn: ${exam.max_attempts} lần`
                        : "Không giới hạn số lần làm"}
                    </p>
                  )}
                </div>

                <div className="exam-action">
                  <Link to={`/exam/${exam.id}`} className="btn-start">
                    Vào làm bài
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Exams;
