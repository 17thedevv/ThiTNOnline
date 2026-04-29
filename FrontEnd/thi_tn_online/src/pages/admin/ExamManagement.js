import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaFileAlt, FaSearch, FaEye, FaCalendarAlt,
  FaClock, FaUser, FaChalkboardTeacher
} from "react-icons/fa";
import { getAllExams } from "../../api/admin";
import "./ExamManagement.css";

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllExams()
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = exams.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="exam-mgmt">
      {/* HEADER */}
      <div className="em-header">
        <div className="em-header-title">
          <div className="em-header-icon"><FaFileAlt /></div>
          <div>
            <h1>Quản lý bài thi</h1>
            <p>{exams.length} bài thi trong hệ thống</p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="em-search-wrap">
        <FaSearch className="em-search-icon" />
        <input
          className="em-search"
          type="text"
          placeholder="Tìm kiếm bài thi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="em-table-wrap">
        {loading ? (
          <div className="em-loading">
            <div className="em-spinner" />
            <span>Đang tải...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="em-empty">
            <FaFileAlt />
            <span>Không có bài thi nào.</span>
          </div>
        ) : (
          <table className="em-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên bài thi</th>
                <th>Lớp học</th>
                <th>Thời gian</th>
                <th>Hạn nộp</th>
                <th>Số lần tối đa</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exam) => (
                <tr key={exam.id}>
                  <td className="em-td-id">#{exam.id}</td>
                  <td>
                    <div className="em-exam-title">
                      <div className="em-exam-icon"><FaFileAlt /></div>
                      <span>{exam.title}</span>
                    </div>
                  </td>
                  <td>
                    {exam.exam_class ? (
                      <span className="em-class-badge">
                        <FaChalkboardTeacher /> {exam.exam_class_name || `Lớp #${exam.exam_class}`}
                      </span>
                    ) : (
                      <span className="em-no-class">Chưa gán lớp</span>
                    )}
                  </td>
                  <td>
                    <span className="em-duration">
                      <FaClock /> {exam.duration} phút
                    </span>
                  </td>
                  <td>
                    {exam.due_date ? (
                      <span className="em-date">
                        <FaCalendarAlt />
                        {new Date(exam.due_date).toLocaleDateString("vi-VN")}
                      </span>
                    ) : (
                      <span className="em-no-class">Không giới hạn</span>
                    )}
                  </td>
                  <td>
                    {exam.max_attempts != null ? (
                      <span className="em-attempts">{exam.max_attempts} lần</span>
                    ) : (
                      <span className="em-no-class">Không giới hạn</span>
                    )}
                  </td>
                  <td>
                    <NavLink
                      to={`/exam/${exam.id}`}
                      className="em-action-btn"
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;
