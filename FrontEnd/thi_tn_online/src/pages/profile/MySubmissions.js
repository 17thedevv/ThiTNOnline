import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSubmissions } from "../../api/submissions";
import {
  FaHistory, FaCheckCircle, FaTimesCircle, FaClock,
  FaTrophy, FaBook, FaArrowLeft, FaEye, FaChartLine
} from "react-icons/fa";
import "./MySubmissions.css";

const MySubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | passed | failed

  useEffect(() => {
    (async () => {
      try {
        const data = await listSubmissions();
        setSubmissions(data || []);
      } catch {
        setError("Không tải được lịch sử làm bài.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = submissions.filter((s) => {
    if (filter === "passed") return s.score >= 5;
    if (filter === "failed") return s.score < 5;
    return true;
  });

  const stats = {
    total: submissions.length,
    passed: submissions.filter((s) => s.score >= 5).length,
    avgScore: submissions.length
      ? (submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length).toFixed(1)
      : 0,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="my-submissions-page">
        <div className="sub-loading">
          <div className="sub-spinner" />
          <p>Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-submissions-page">
      {/* Header */}
      <div className="sub-header">
        <button className="sub-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        <div className="sub-title-wrap">
          <FaHistory className="sub-title-icon" />
          <h1>Lịch sử làm bài</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="sub-stats-grid">
        <div className="sub-stat-card total">
          <FaBook className="sub-stat-icon" />
          <div>
            <div className="sub-stat-value">{stats.total}</div>
            <div className="sub-stat-label">Bài đã làm</div>
          </div>
        </div>
        <div className="sub-stat-card passed">
          <FaTrophy className="sub-stat-icon" />
          <div>
            <div className="sub-stat-value">{stats.passed}</div>
            <div className="sub-stat-label">Bài đạt</div>
          </div>
        </div>
        <div className="sub-stat-card failed">
          <FaTimesCircle className="sub-stat-icon" />
          <div>
            <div className="sub-stat-value">{stats.total - stats.passed}</div>
            <div className="sub-stat-label">Bài chưa đạt</div>
          </div>
        </div>
        <div className="sub-stat-card avg">
          <FaChartLine className="sub-stat-icon" />
          <div>
            <div className="sub-stat-value">{stats.avgScore}</div>
            <div className="sub-stat-label">Điểm TB</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="sub-filter-bar">
        {[
          { key: "all", label: "Tất cả" },
          { key: "passed", label: "Đã đạt" },
          { key: "failed", label: "Chưa đạt" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`sub-filter-btn ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
        <span className="sub-filter-count">{filtered.length} kết quả</span>
      </div>

      {/* Error */}
      {error && (
        <div className="sub-error">
          <FaTimesCircle /> {error}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="sub-empty">
          <FaHistory className="sub-empty-icon" />
          <p>Chưa có kết quả nào{filter !== "all" ? " trong bộ lọc này" : ""}.</p>
        </div>
      ) : (
        <div className="sub-list">
          {filtered.map((sub) => {
            const isPassed = sub.score >= 5;
            return (
              <div key={sub.id} className={`sub-card ${isPassed ? "passed" : "failed"}`}>
                <div className="sub-card-left">
                  <div className={`sub-badge ${isPassed ? "pass" : "fail"}`}>
                    {isPassed ? <FaCheckCircle /> : <FaTimesCircle />}
                    {isPassed ? "Đạt" : "Chưa đạt"}
                  </div>
                  <div className="sub-card-info">
                    <h3 className="sub-card-title">
                      {sub.exam_title || sub.exam?.title || `Bài thi #${sub.exam}`}
                    </h3>
                    <div className="sub-card-meta">
                      <span><FaClock /> {formatDate(sub.submitted_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="sub-card-right">
                  <div className={`sub-score ${isPassed ? "pass" : "fail"}`}>
                    {sub.score?.toFixed?.(1) ?? sub.score ?? "—"}
                    <span className="sub-score-max">/10</span>
                  </div>
                  <button
                    className="sub-view-btn"
                    onClick={() => navigate(`/exam/${sub.exam?.id || sub.exam}`)}
                    title="Xem lại đề thi"
                  >
                    <FaEye /> Xem lại
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
