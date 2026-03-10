import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Classes.css";
import {
  createClass,
  joinClassByCode,
  leaveClass,
  listClasses,
} from "../../api/classes";
import { useAuth } from "../../contexts/AuthContext";

const Classes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const isTeacherLike = role === "teacher" || role === "admin";

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newClassName, setNewClassName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const [leavingId, setLeavingId] = useState(null);

  const title = useMemo(
    () => (isTeacherLike ? "Lớp học của tôi (giáo viên)" : "Lớp học của tôi"),
    [isTeacherLike]
  );

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listClasses();
      setClasses(data || []);
    } catch {
      setError("Không tải được danh sách lớp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!newClassName.trim()) return;
    setIsCreating(true);
    setError("");
    try {
      await createClass({ name: newClassName.trim() });
      setNewClassName("");
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.name?.[0] ||
        e?.response?.data?.detail ||
        "Tạo lớp thất bại.";
      setError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setIsJoining(true);
    setError("");
    try {
      await joinClassByCode({ code });
      setJoinCode("");
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Tham gia lớp thất bại. Vui lòng kiểm tra lại mã lớp.";
      setError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async (classId) => {
    setLeavingId(classId);
    setError("");
    try {
      await leaveClass({ classId });
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.detail || "Rời lớp thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <div className="classes-container">
      <div className="classes-header">
        <h2>{title}</h2>

        {isTeacherLike ? (
          <div className="create-class">
            <input
              className="create-class-input"
              placeholder="Tên lớp mới..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <button
              className="create-class-btn"
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? "Đang tạo..." : "+ Tạo lớp"}
            </button>
          </div>
        ) : (
          <div className="create-class">
            <input
              className="create-class-input"
              placeholder="Nhập mã lớp (VD: ABC-123)..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button
              className="create-class-btn"
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? "Đang tham gia..." : "Tham gia lớp"}
            </button>
          </div>
        )}
      </div>

      {error ? <div className="classes-error">{error}</div> : null}

      {loading ? (
        <p>Đang tải lớp...</p>
      ) : (
        <div className="class-grid">
          {classes.length === 0 ? (
            <p>
              {isTeacherLike
                ? "Bạn chưa tạo lớp nào."
                : "Bạn chưa tham gia lớp nào."}
            </p>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.id}
                className="class-card"
                onClick={() => navigate(`/classes/${cls.id}`)}
              >
                <div className="class-main">
                  <div>{cls.name}</div>
                  {isTeacherLike && (
                    <div className="class-code">Mã lớp: {cls.code}</div>
                  )}
                </div>

                {!isTeacherLike && (
                  <button
                    className="leave-class-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeave(cls.id);
                    }}
                    disabled={leavingId === cls.id}
                  >
                    {leavingId === cls.id ? "Đang rời..." : "Rời lớp"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Classes;