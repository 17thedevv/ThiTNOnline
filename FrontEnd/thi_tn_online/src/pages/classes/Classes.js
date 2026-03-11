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
import { 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaPlus, 
  FaSignOutAlt, 
  FaUsers, 
  FaBook, 
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaGraduationCap,
  FaDoorOpen,
  FaCode,
  FaClock
} from "react-icons/fa";

const Classes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const isTeacherLike = role === "teacher" || role === "admin";

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [newClassName, setNewClassName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const [leavingId, setLeavingId] = useState(null);

  const title = useMemo(
    () => (isTeacherLike ? "Lớp học của tôi (giáo viên)" : "Lớp học của tôi"),
    [isTeacherLike]
  );

  const filteredAndSortedClasses = useMemo(() => {
    let filtered = classes.filter(cls => 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "created") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

    return filtered;
  }, [classes, searchTerm, sortBy]);

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

  const getStats = (cls) => {
    const studentCount = cls.students?.length || 0;
    const examCount = cls.exams?.length || 0;
    return { studentCount, examCount };
  };

  if (loading) {
    return (
      <div className="classes-loading">
        <div className="loading-spinner">
          <FaGraduationCap className="spinner-icon" />
          <p>Đang tải danh sách lớp học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="classes-container">
      <div className="classes-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              {isTeacherLike ? <FaChalkboardTeacher /> : <FaUserGraduate />}
            </div>
            <div>
              <h1>{title}</h1>
              <p className="header-subtitle">
                {classes.length} lớp học • {isTeacherLike ? "Quản lý lớp" : "Học tập"}
              </p>
            </div>
          </div>
        </div>
        
        {isTeacherLike ? (
          <div className="create-class-section">
            <div className="input-group">
              <FaPlus className="input-icon" />
              <input
                className="create-class-input"
                placeholder="Nhập tên lớp mới..."
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <button
              className="create-class-btn primary"
              onClick={handleCreate}
              disabled={isCreating || !newClassName.trim()}
            >
              {isCreating ? (
                <>
                  <div className="btn-spinner"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <FaPlus /> Tạo lớp mới
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="join-class-section">
            <div className="input-group">
              <FaCode className="input-icon" />
              <input
                className="join-class-input"
                placeholder="Nhập mã lớp (VD: ABC-123)..."
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            <button
              className="join-class-btn primary"
              onClick={handleJoin}
              disabled={isJoining || !joinCode.trim()}
            >
              {isJoining ? (
                <>
                  <div className="btn-spinner"></div>
                  Đang tham gia...
                </>
              ) : (
                <>
                  <FaDoorOpen /> Tham gia lớp
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && <div className="classes-error">{error}</div>}

      <div className="classes-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <div className="sort-dropdown">
              <FaFilter className="filter-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Sắp xếp theo tên</option>
                <option value="created">Sắp xếp theo ngày tạo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="classes-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaChalkboardTeacher />
          </div>
          <div className="stat-content">
            <h3>{classes.length}</h3>
            <p>Tổng số lớp</p>
          </div>
        </div>
        
        {isTeacherLike && (
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)}</h3>
              <p>Tổng số học sinh</p>
            </div>
          </div>
        )}
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{classes.reduce((sum, cls) => sum + (cls.exams?.length || 0), 0)}</h3>
            <p>Tổng số bài thi</p>
          </div>
        </div>
      </div>

      <div className="class-grid">
        {filteredAndSortedClasses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {isTeacherLike ? <FaChalkboardTeacher /> : <FaUserGraduate />}
            </div>
            <h3>
              {searchTerm 
                ? "Không tìm thấy lớp học nào" 
                : isTeacherLike 
                  ? "Bạn chưa tạo lớp nào" 
                  : "Bạn chưa tham gia lớp nào"
              }
            </h3>
            <p>
              {searchTerm 
                ? "Thử tìm kiếm với từ khóa khác" 
                : isTeacherLike 
                  ? "Bắt đầu bằng cách tạo lớp học đầu tiên của bạn" 
                  : "Tham gia lớp học bằng mã lớp từ giáo viên"
              }
            </p>
          </div>
        ) : (
          filteredAndSortedClasses.map((cls) => {
            const { studentCount, examCount } = getStats(cls);
            return (
              <div
                key={cls.id}
                className="class-card"
                onClick={() => navigate(`/classes/${cls.id}`)}
              >
                <div className="class-header">
                  <div className="class-icon">
                    <FaChalkboardTeacher />
                  </div>
                  <div className="class-badge">
                    {isTeacherLike ? "Giáo viên" : "Học sinh"}
                  </div>
                </div>
                
                <div className="class-content">
                  <h3 className="class-name">{cls.name}</h3>
                  
                  {isTeacherLike && (
                    <div className="class-code">
                      <FaCode /> Mã lớp: <strong>{cls.code}</strong>
                    </div>
                  )}
                  
                  <div className="class-meta">
                    <div className="meta-item">
                      <FaUsers />
                      <span>{isTeacherLike ? studentCount : 1} học sinh</span>
                    </div>
                    <div className="meta-item">
                      <FaBook />
                      <span>{examCount} bài thi</span>
                    </div>
                    <div className="meta-item">
                      <FaCalendarAlt />
                      <span>{new Date(cls.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="class-actions">
                  <button className="view-class-btn primary">
                    <FaChalkboardTeacher /> Xem chi tiết
                  </button>
                  
                  {!isTeacherLike && (
                    <button
                      className="leave-class-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeave(cls.id);
                      }}
                      disabled={leavingId === cls.id}
                    >
                      {leavingId === cls.id ? (
                        <>
                          <div className="btn-spinner"></div>
                          Đang rời...
                        </>
                      ) : (
                        <>
                          <FaSignOutAlt /> Rời lớp
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Classes;