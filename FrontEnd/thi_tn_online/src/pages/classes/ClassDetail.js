import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassDetail, removeStudentFromClass } from "../../api/classes";
import { listExams } from "../../api/exams";
import { listClassSubmissions } from "../../api/submissions";
import { useAuth } from "../../contexts/AuthContext";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role;
  const isTeacherLike = role === "teacher" || role === "admin";

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getClassDetail({ classId });
        setCls(data);

        // load exams of this class
        setLoadingExams(true);
        const [exs, subs] = await Promise.all([
          listExams({ class_id: classId }),
          listClassSubmissions({ classId }),
        ]);
        setExams(exs || []);
        setLoadingExams(false);
        setSubmissions(subs || []);
        setLoadingSubs(false);
      } catch (e) {
        const msg =
          e?.response?.status === 403
            ? "Bạn không có quyền truy cập lớp này. Vui lòng liên hệ giáo viên của lớp."
            : e?.response?.data?.detail ||
              "Không tải được thông tin lớp. Vui lòng thử lại.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      load();
    }
  }, [classId]);

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá học sinh này khỏi lớp?")) {
      return;
    }

    setRemovingId(studentId);
    setError("");
    try {
      await removeStudentFromClass({ classId, studentId });
      const data = await getClassDetail({ classId });
      setCls(data);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Không xoá được học sinh khỏi lớp. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopyCode = async () => {
    if (!cls?.code) return;
    try {
      await navigator.clipboard.writeText(cls.code);
      alert("Đã sao chép mã lớp.");
    } catch {
      alert("Không sao chép được mã lớp, hãy copy thủ công.");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2>{cls ? cls.name : `Lớp #${classId}`}</h2>
        <button
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            background: "white",
            cursor: "pointer",
          }}
          onClick={() => navigate("/classes")}
        >
          ← Quay lại danh sách lớp
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "12px",
            color: "#b91c1c",
            background: "#fee2e2",
            padding: "8px 12px",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p>Đang tải thông tin lớp...</p>
      ) : !cls ? (
        <p>Không tìm thấy lớp.</p>
      ) : (
        <>
          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              marginBottom: "16px",
            }}
          >
            <p>
              <strong>Tên lớp:</strong> {cls.name}
            </p>

            {isTeacherLike && (
              <div style={{ marginTop: "8px" }}>
                <strong>Mã lớp:</strong>{" "}
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "#eff6ff",
                    fontFamily: "monospace",
                  }}
                >
                  {cls.code}
                </span>
                <button
                  style={{
                    marginLeft: "8px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#3b82f6",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={handleCopyCode}
                >
                  Sao chép mã
                </button>
              </div>
            )}

            <p style={{ marginTop: "8px" }}>
              <strong>Số học sinh:</strong> {cls.students_count ?? 0}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              marginBottom: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0 }}>Đề thi của lớp</h3>
              {isTeacherLike && (
                <button
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#ec4899",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    navigate(`/subjects/0/create-exam`, {
                      state: { classId },
                    })
                  }
                >
                  + Tạo đề cho lớp này
                </button>
              )}
            </div>

            {loadingExams ? (
              <p>Đang tải đề thi...</p>
            ) : exams.length === 0 ? (
              <p>Chưa có đề thi nào gắn với lớp này.</p>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div>
                      <strong>{exam.title}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      Thời gian: {exam.duration} phút
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "1px solid #3b82f6",
                      background: "white",
                      color: "#3b82f6",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/exam/${exam.id}`)}
                  >
                    Xem / Thi
                  </button>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
              Danh sách học sinh
            </h3>
            {(!cls.students || cls.students.length === 0) && (
              <p>Chưa có học sinh nào trong lớp.</p>
            )}

            {cls.students &&
              cls.students.map((stu) => (
                <div
                  key={stu.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div>
                    <div>
                      <strong>{stu.username}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                      {stu.email}
                    </div>
                  </div>

                  {isTeacherLike && (
                    <button
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#ef4444",
                        color: "white",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                      disabled={removingId === stu.id}
                      onClick={() => handleRemoveStudent(stu.id)}
                    >
                      {removingId === stu.id ? "Đang xoá..." : "Xoá khỏi lớp"}
                    </button>
                  )}
                </div>
              ))}
          </div>

          {isTeacherLike && (
            <div
              style={{
                background: "white",
                padding: "16px",
                borderRadius: "10px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                marginTop: "16px",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                Bảng điểm (tất cả bài nộp)
              </h3>
              {loadingSubs ? (
                <p>Đang tải bảng điểm...</p>
              ) : submissions.length === 0 ? (
                <p>Chưa có bài nộp nào trong lớp này.</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 8 }}>Học sinh</th>
                      <th style={{ textAlign: "left", padding: 8 }}>Đề thi</th>
                      <th style={{ padding: 8 }}>Điểm</th>
                      <th style={{ padding: 8 }}>Thời gian nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #e5e7eb",
                          }}
                        >
                          {sub.student_username || `#${sub.student}`}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #e5e7eb",
                          }}
                        >
                          {sub.exam_title || `Đề #${sub.exam}`}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #e5e7eb",
                            textAlign: "center",
                          }}
                        >
                          {sub.score}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            borderTop: "1px solid #e5e7eb",
                            textAlign: "center",
                          }}
                        >
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleString()
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassDetail;