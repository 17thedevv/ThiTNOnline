import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClassDetail, removeStudentFromClass, updateClass, updateClassAvatar } from "../../api/classes";
import { listExams, deleteExam } from "../../api/exams";
import { getSubjectsByClass, createSubject, deleteSubject, getExamsBySubject } from "../../api/admin";
import { listClassSubmissions, exportClassSubmissions, deleteSubmission, approveSubmission } from "../../api/submissions";
import { useAuth } from "../../contexts/AuthContext";
import "./ClassDetail.css";
import { 
  FaArrowLeft, 
  FaUsers, 
  FaClipboardList, 
  FaChartBar, 
  FaPlus, 
  FaTrash, 
  FaCopy, 
  FaUserGraduate,
  FaClock,
  FaBook,
  FaStar,
  FaChartLine,
  FaDownload,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaCalendarAlt,
  FaTrophy,
  FaMedal,
  FaCamera
} from "react-icons/fa";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper function to get full name
  const getStudentFullName = (student) => {
    if (!student) return 'Không xác định';
    
    // Try to get from student object first
    const firstName = student.first_name || '';
    const lastName = student.last_name || '';
    const fullName = `${lastName} ${firstName}`.trim();
    
    if (fullName) return fullName;
    
    // Fallback to other possible fields
    return student.student_full_name || 
           student.full_name || 
           student.display_name || 
           student.username || 
           'Không xác định';
  };

  const role = user?.role;
  const isTeacherLike = role === "teacher" || role === "admin";

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [examSearchTerm, setExamSearchTerm] = useState("");
  const [removingExamId, setRemovingExamId] = useState(null);
  const [removingSubmissionId, setRemovingSubmissionId] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [approveForm, setApproveForm] = useState({ score: 0, teacher_note: "" });
  const [isApproving, setIsApproving] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Môn học
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null); // môn đang xem bài thi
  const [subjectExams, setSubjectExams] = useState([]);
  const [loadingSubjectExams, setLoadingSubjectExams] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [addingSubject, setAddingSubject] = useState(false);
  const [removingSubjectId, setRemovingSubjectId] = useState(null);

  // Load môn học của lớp
  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const data = await getSubjectsByClass(classId);
      setSubjects(data || []);
    } catch (e) {
      console.error('Lỗi load subjects:', e);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Xem bài thi của môn học
  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    setLoadingSubjectExams(true);
    try {
      const data = await getExamsBySubject(subject.id);
      setSubjectExams(data || []);
    } catch (e) {
      console.error('Lỗi load exams by subject:', e);
    } finally {
      setLoadingSubjectExams(false);
    }
  };

  // Thêm môn học mới
  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    setAddingSubject(true);
    try {
      await createSubject({ name: newSubjectName.trim(), class_obj: parseInt(classId) });
      setNewSubjectName("");
      await loadSubjects();
    } catch (err) {
      alert('Không thể thêm môn học.');
    } finally {
      setAddingSubject(false);
    }
  };

  // Xóa môn học
  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Xóa môn học này sẽ xóa toàn bộ bài thi bên trong. Bạn chắc chắn?')) return;
    setRemovingSubjectId(subjectId);
    try {
      await deleteSubject(subjectId);
      if (selectedSubject?.id === subjectId) {
        setSelectedSubject(null);
        setSubjectExams([]);
      }
      await loadSubjects();
    } catch (err) {
      alert('Không thể xóa môn học.');
    } finally {
      setRemovingSubjectId(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const data = await getClassDetail({ classId });
        setCls(data);

        // load exams (tương thích ngược) + subjects + submissions
        setLoadingExams(true);
        const [exs, subs] = await Promise.all([
          listExams({ class_id: classId }),
          listClassSubmissions({ classId }),
        ]);
        setExams(exs || []);
        setLoadingExams(false);
        setSubmissions(subs || []);
        setLoadingSubs(false);

        // Load môn học
        try {
          const subjData = await getSubjectsByClass(classId);
          setSubjects(subjData || []);
        } catch (e) {
          console.error('Lỗi load subjects:', e);
        }
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

  useEffect(() => {
    if (cls) {
      setEditedName(cls.name);
    }
  }, [cls]);

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === cls.name) {
      setIsEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await updateClass({ classId, name: editedName.trim() });
      setCls({ ...cls, name: editedName.trim() });
      setIsEditingName(false);
      
      const toast = document.createElement('div');
      toast.className = 'toast-success';
      toast.textContent = 'Đã cập nhật tên lớp thành công!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (e) {
      const msg = e?.response?.data?.name?.[0] || e?.response?.data?.detail || 'Lỗi khi cập nhật tên lớp.';
      setError(msg);
    } finally {
      setSavingName(false);
    }
  };

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

  const handleRemoveExam = async (examId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài thi này? Mọi kết quả của bài thi cũng có thể bị mất.")) {
      return;
    }
    setRemovingExamId(examId);
    try {
      await deleteExam(examId);
      setExams((prev) => prev.filter((ex) => ex.id !== examId));
      const toast = document.createElement('div');
      toast.className = 'toast-success';
      toast.textContent = 'Đã xóa bài thi thành công!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch(e) {
      const msg = e?.response?.data?.detail || "Không xoá được bài thi. Vui lòng thử lại.";
      alert(msg);
    } finally {
      setRemovingExamId(null);
    }
  };

  const handleRemoveSubmission = async (submissionId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài nộp này?")) return;
    setRemovingSubmissionId(submissionId);
    try {
      await deleteSubmission(submissionId);
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      const toast = document.createElement('div');
      toast.className = 'toast-success';
      toast.textContent = 'Đã xóa bài nộp thành công!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch(e) {
      alert("Không xóa được bài nộp.");
    } finally {
      setRemovingSubmissionId(null);
    }
  };

  const openApproveModal = (sub) => {
    setApproveTarget(sub);
    setApproveForm({ score: sub.score, teacher_note: sub.teacher_note || "" });
    setApproveModalOpen(true);
  };

  const handleApproveSubmission = async (e) => {
    e.preventDefault();
    setIsApproving(true);
    try {
      const updated = await approveSubmission(approveTarget.id, {
        score: approveForm.score,
        teacher_note: approveForm.teacher_note
      });
      setSubmissions(prev => prev.map(s => s.id === approveTarget.id ? updated.submission : s));
      setApproveModalOpen(false);
      const toast = document.createElement('div');
      toast.className = 'toast-success';
      toast.textContent = 'Cập nhật bài nộp thành công!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch(err) {
      alert("Chỉnh sửa thất bại.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleCopyCode = async () => {
    if (!cls?.code) return;
    try {
      await navigator.clipboard.writeText(cls.code);
      // Thay alert bằng toast notification
      const toast = document.createElement('div');
      toast.className = 'toast-success';
      toast.textContent = 'Đã sao chép mã lớp!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch {
      const toast = document.createElement('div');
      toast.className = 'toast-error';
      toast.textContent = 'Không sao chép được mã lớp, hãy copy thủ công.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const filteredStudents = cls?.students?.filter(student =>
    getStudentFullName(student).toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredExams = exams.filter(ex => 
    ex.title?.toLowerCase().includes(examSearchTerm.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(sub => {
    const studentFullName = sub.student_full_name || sub.student_username || '';
    const matchesSearch = studentFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.exam_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "passed" && sub.score >= 5) ||
                         (filterStatus === "failed" && sub.score < 5);
    return matchesSearch && matchesFilter;
  });

  const getAverageScore = () => {
    if (submissions.length === 0) return 0;
    const total = submissions.reduce((sum, sub) => sum + sub.score, 0);
    return (total / submissions.length).toFixed(1);
  };

  const getPassRate = () => {
    if (submissions.length === 0) return 0;
    const passed = submissions.filter(sub => sub.score >= 5).length;
    return Math.round((passed / submissions.length) * 100);
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await exportClassSubmissions({ classId });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from header if possible, else default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `BangDiem_${cls?.name || classId}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const toast = document.createElement('div');
      toast.className = 'toast-success';
      toast.textContent = 'Đã xuất file bảng điểm thành công!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (e) {
      console.error('Export error:', e);
      const toast = document.createElement('div');
      toast.className = 'toast-error';
      toast.textContent = 'Lỗi khi xuất file. Vui lòng thử lại.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="class-detail-container">
      {/* Header */}
      <div className="class-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate("/classes")}
          >
            <FaArrowLeft /> Quay lại
          </button>
          <div className="class-title">
            {isEditingName ? (
              <div className="edit-name-group">
                <input
                  type="text"
                  className="edit-name-input"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={savingName}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <div className="edit-actions">
                  <button 
                    className="save-btn" 
                    onClick={handleSaveName}
                    disabled={savingName || !editedName.trim()}
                  >
                    {savingName ? <div className="mini-spinner-white"></div> : 'Lưu'}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => {
                      setIsEditingName(false);
                      setEditedName(cls.name);
                    }}
                    disabled={savingName}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="title-row">
                <div className="class-detail-avatar-wrap">
                  {cls && (cls.avatar || cls.teacher_avatar) ? (
                    <img 
                      src={cls.avatar || cls.teacher_avatar} 
                      alt={cls.name} 
                      className="class-detail-avatar" 
                    />
                  ) : (
                    <div className="class-detail-avatar-fallback">
                      {(cls?.name || 'L').charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isTeacherLike && (
                    <label className="avatar-upload-overlay" title="Thay đổi ảnh lớp">
                      {uploadingAvatar ? <div className="mini-spinner-white"></div> : <FaCamera />}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingAvatar(true);
                          try {
                            const res = await updateClassAvatar({ classId, avatarFile: file });
                            setCls({ ...cls, avatar: res.avatar || res.class_avatar });
                            const toast = document.createElement('div');
                            toast.className = 'toast-success';
                            toast.textContent = 'Đã cập nhật ảnh lớp!';
                            document.body.appendChild(toast);
                            setTimeout(() => toast.remove(), 3000);
                            
                            // Reload to ensure all data is synced
                            const newData = await getClassDetail({ classId });
                            setCls(newData);
                          } catch (err) {
                            alert('Không thể cập nhật ảnh lớp.');
                          } finally {
                            setUploadingAvatar(false);
                          }
                        }}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  )}
                </div>
                <h1>{cls ? cls.name : `Lớp #${classId}`}</h1>
                {isTeacherLike && cls && (
                  <button 
                    className="edit-title-btn"

                    onClick={() => setIsEditingName(true)}
                    title="Sửa tên lớp"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
            )}
            <span className="class-id">ID: {classId}</span>
          </div>
        </div>
        <div className="header-actions">
          {isTeacherLike && cls?.code && (
            <div className="class-code-section">
              <span className="code-label">Mã lớp:</span>
              <div className="code-display">
                <span className="code-text">{cls.code}</span>
                <button className="copy-btn" onClick={handleCopyCode}>
                  <FaCopy />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thông tin lớp...</p>
        </div>
      ) : !cls ? (
        <div className="not-found">
          <FaBook className="not-found-icon" />
          <h2>Không tìm thấy lớp</h2>
          <p>Lớp học này không tồn tại hoặc đã bị xóa.</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>{cls.students_count ?? 0}</h3>
                <p>Học sinh</p>
              </div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">
                <FaClipboardList />
              </div>
              <div className="stat-content">
                <h3>{exams.length}</h3>
                <p>Đề thi</p>
              </div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>{getAverageScore()}</h3>
                <p>Điểm trung bình</p>
              </div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">
                <FaTrophy />
              </div>
              <div className="stat-content">
                <h3>{getPassRate()}%</h3>
                <p>Tỷ lệ đạt</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <FaChartBar /> Tổng quan
            </button>
            <button 
              className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
              onClick={() => setActiveTab("students")}
            >
              <FaUsers /> Học sinh ({cls.students_count ?? 0})
            </button>
            <button
              className={`tab-btn ${activeTab === "subjects" ? "active" : ""}`}
              onClick={() => setActiveTab("subjects")}
            >
              <FaBook /> Môn học ({subjects.length})
            </button>
            {isTeacherLike && (
              <button 
                className={`tab-btn ${activeTab === "submissions" ? "active" : ""}`}
                onClick={() => setActiveTab("submissions")}
              >
                <FaChartLine /> Bảng điểm ({submissions.length})
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "overview" && (
              <div className="overview-content">
                <div className="overview-grid">
                  <div className="overview-card">
                    <h3><FaUsers /> Thông tin lớp học</h3>
                    <div className="info-list">
                      <div className="info-item">
                        <span className="info-label">Tên lớp:</span>
                        <span className="info-value">{cls.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Giáo viên:</span>
                        <span className="info-value"><strong>{cls.teacher_full_name || cls.teacher_name}</strong></span>
                      </div>
                      {isTeacherLike && (
                        <div className="info-item">
                          <span className="info-label">Mã lớp:</span>
                          <span className="info-value code-value">{cls.code}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="info-label">Số học sinh:</span>
                        <span className="info-value">{cls.students_count ?? 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overview-card">
                    <h3><FaStar /> Hoạt động gần đây</h3>
                    <div className="recent-activities">
                      {submissions.slice(0, 5).map(sub => {
                        return (
                        <div key={sub.id} className="activity-item">
                          <div className="activity-icon">
                            <FaUserGraduate />
                          </div>
                          <div className="activity-content">
                            <p><strong>{sub.student_full_name || sub.student_username || 'Không xác định'}</strong> đã nộp bài <strong>{sub.exam_title}</strong></p>
                            <span className="activity-time">
                              {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <div className="activity-score">
                            <span className={`score ${sub.score >= 5 ? 'passed' : 'failed'}`}>
                              {sub.score}
                            </span>
                          </div>
                        </div>
                        );
                      })}
                      {submissions.length === 0 && (
                        <p className="no-activities">Chưa có hoạt động nào.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "students" && (
              <div className="students-content">
                <div className="content-header">
                  <h3><FaUsers /> Danh sách học sinh</h3>
                  <div className="search-filter">
                    <div className="search-box">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm học sinh..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="students-grid">
                  {filteredStudents.length === 0 ? (
                    <div className="empty-state">
                      <FaUserGraduate className="empty-icon" />
                      <p>Không tìm thấy học sinh nào.</p>
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div key={student.id} className="student-card">
                        <div className="student-avatar">
                          <FaUserGraduate />
                        </div>
                        <div className="student-info">
                          <h4>{getStudentFullName(student)}</h4>
                          <p>{student.email}</p>
                        </div>
                        {isTeacherLike && (
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveStudent(student.id)}
                            disabled={removingId === student.id}
                          >
                            {removingId === student.id ? (
                              <div className="mini-spinner"></div>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "subjects" && (
              <div className="exams-content">
                <div className="content-header">
                  <h3><FaBook /> Môn học của lớp</h3>
                </div>

                {/* Form thêm môn học mới (chỉ teacher/admin) */}
                {isTeacherLike && (
                  <form onSubmit={handleAddSubject} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <input
                      type="text"
                      placeholder="Tên môn học mới..."
                      value={newSubjectName}
                      onChange={e => setNewSubjectName(e.target.value)}
                      disabled={addingSubject}
                      style={{
                        flex: 1,
                        padding: '8px 14px',
                        border: '2px solid #d9d9d9',
                        borderRadius: 8,
                        fontSize: 15,
                        color: '#222',
                        background: '#fff',
                        outline: 'none',
                        cursor: 'text',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#1890ff'}
                      onBlur={e => e.target.style.borderColor = '#d9d9d9'}
                    />
                    <button type="submit" className="create-btn" disabled={addingSubject || !newSubjectName.trim()}>
                      {addingSubject ? <div className="mini-spinner-white"></div> : <><FaPlus /> Thêm môn</>}
                    </button>
                  </form>
                )}

                {loadingSubjects ? (
                  <div className="loading-container"><div className="spinner"></div><p>Đang tải môn học...</p></div>
                ) : subjects.length === 0 ? (
                  <div className="empty-state">
                    <FaBook className="empty-icon" />
                    <p>Lớp chưa có môn học nào.{isTeacherLike && " Hãy thêm môn học ở trên."}</p>
                  </div>
                ) : (
                  <div className="exams-grid">
                    {subjects.map(subject => (
                      <div
                        key={subject.id}
                        className={`exam-card ${selectedSubject?.id === subject.id ? 'selected' : ''}`}
                        style={{ cursor: 'pointer', border: selectedSubject?.id === subject.id ? '2px solid var(--primary)' : undefined }}
                        onClick={() => handleSelectSubject(subject)}
                      >
                        <div className="exam-header">
                          <h4><FaBook style={{ marginRight: 8 }} />{subject.name}</h4>
                          <span className="exam-duration">{subject.exam_count ?? 0} bài thi</span>
                        </div>
                        <div className="exam-actions">
                          {isTeacherLike && (
                            <>
                              <button
                                className="create-btn"
                                onClick={e => { e.stopPropagation(); navigate(`/exams/create`, { state: { subjectId: subject.id, classId, subjectName: subject.name } }); }}
                              >
                                <FaPlus /> Tạo bài thi
                              </button>
                              <button
                                className="remove-btn exam-del-btn"
                                onClick={e => { e.stopPropagation(); handleDeleteSubject(subject.id); }}
                                disabled={removingSubjectId === subject.id}
                              >
                                {removingSubjectId === subject.id ? <div className="mini-spinner"></div> : <FaTrash />}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Danh sách bài thi trong môn đã chọn */}
                {selectedSubject && (
                  <div style={{ marginTop: 32 }}>
                    <h3><FaClipboardList /> Bài thi trong môn: <strong>{selectedSubject.name}</strong></h3>
                    {loadingSubjectExams ? (
                      <div className="loading-container"><div className="spinner"></div></div>
                    ) : subjectExams.length === 0 ? (
                      <div className="empty-state">
                        <FaClipboardList className="empty-icon" />
                        <p>Môn học này chưa có bài thi nào.</p>
                        {isTeacherLike && (
                          <button className="create-btn" onClick={() => navigate(`/exams/create`, { state: { subjectId: selectedSubject.id, classId, subjectName: selectedSubject.name } })}>
                            <FaPlus /> Tạo bài thi đầu tiên
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="exams-grid">
                        {subjectExams.map(exam => (
                          <div key={exam.id} className="exam-card">
                            <div className="exam-header">
                              <h4>{exam.title}</h4>
                              <span className="exam-duration"><FaClock /> {exam.duration} phút</span>
                            </div>
                            <div className="exam-actions">
                              <button className="view-btn" onClick={() => navigate(`/exam/${exam.id}`)}>
                                <FaEye /> Xem / Thi
                              </button>
                              {isTeacherLike && (
                                <>
                                  <button className="edit-btn" onClick={() => navigate(`/exams/${exam.id}/edit`)}>
                                    <FaEdit /> Sửa
                                  </button>
                                  <button
                                    className="remove-btn exam-del-btn"
                                    onClick={() => handleRemoveExam(exam.id)}
                                    disabled={removingExamId === exam.id}
                                  >
                                    {removingExamId === exam.id ? <div className="mini-spinner"></div> : <FaTrash />}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "exams" && (
              <div className="exams-content">
                <div className="content-header">
                  <h3><FaClipboardList /> Đề thi của lớp</h3>
                  <div className="header-actions-row">
                    <div className="search-box">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm bài thi..."
                        value={examSearchTerm}
                        onChange={(e) => setExamSearchTerm(e.target.value)}
                      />
                    </div>
                    {isTeacherLike && (
                      <button
                        className="create-btn"
                        onClick={() =>
                          navigate(`/exams/create`, {
                            state: { classId },
                          })
                        }
                      >
                        <FaPlus /> Tạo đề thi mới
                      </button>
                    )}
                  </div>
                </div>

                {loadingExams ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải đề thi...</p>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="empty-state">
                    <FaClipboardList className="empty-icon" />
                    <p>Chưa có đề thi nào trong lớp này.</p>
                    {isTeacherLike && (
                      <button
                        className="create-btn"
                        onClick={() =>
                          navigate(`/exams/create`, {
                            state: { classId },
                          })
                        }
                      >
                        <FaPlus /> Tạo đề thi đầu tiên
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="exams-grid">
                    {filteredExams.map((exam) => (
                      <div key={exam.id} className="exam-card">
                        <div className="exam-header">
                          <h4>{exam.title}</h4>
                          <span className="exam-duration">
                            <FaClock /> {exam.duration} phút
                          </span>
                        </div>
                        <div className="exam-actions">
                          <button
                            className="view-btn"
                            onClick={() => navigate(`/exam/${exam.id}`)}
                          >
                            <FaEye /> Xem / Thi
                          </button>
                          {isTeacherLike && (
                            <>
                              <button 
                                className="edit-btn"
                                onClick={() => navigate(`/exams/${exam.id}/edit`)}
                              >
                                <FaEdit /> Sửa
                              </button>
                              <button 
                                className="remove-btn exam-del-btn"
                                onClick={() => handleRemoveExam(exam.id)}
                                disabled={removingExamId === exam.id}
                              >
                                {removingExamId === exam.id ? <div className="mini-spinner"></div> : <FaTrash />}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredExams.length === 0 && (
                      <div className="empty-state">
                        <p>Không có bài thi nào khớp tìm kiếm.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "submissions" && isTeacherLike && (
              <div className="submissions-content">
                <div className="content-header">
                  <h3><FaClipboardList /> Bài nộp</h3>
                  <div className="header-actions-row">
                    <button 
                      className="export-btn"
                      onClick={handleExport}
                      disabled={exporting || submissions.length === 0}
                    >
                      {exporting ? (
                        <div className="mini-spinner"></div>
                      ) : (
                        <><FaDownload /> Xuất bảng điểm (CSV)</>
                      )}
                    </button>
                  </div>
                  <div className="filter-controls">
                    <div className="search-filter-group">
                      <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm học sinh hoặc bài thi..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">Tất cả</option>
                        <option value="passed">Đạt</option>
                        <option value="failed">Không đạt</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loadingSubs ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải bảng điểm...</p>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="empty-state">
                    <FaChartLine className="empty-icon" />
                    <p>Chưa có bài nộp nào trong lớp này.</p>
                  </div>
                ) : (
                  <div className="submissions-table-wrapper">
                    <table className="submissions-table">
                      <thead>
                        <tr>
                          <th>Học sinh</th>
                          <th>Đề thi</th>
                          <th>Điểm</th>
                          <th>Trạng thái</th>
                          <th>Thời gian nộp</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((sub) => (
                          <tr key={sub.id}>
                            <td>
                              <div className="student-cell">
                                <FaUserGraduate className="student-icon" />
                                <span>{sub.student_full_name || sub.student_username || `#${sub.student}`}</span>
                              </div>
                            </td>
                            <td>{sub.exam_title || `Đề #${sub.exam}`}</td>
                            <td>
                              <span className={`score-badge ${sub.score >= 5 ? 'passed' : 'failed'}`}>
                                {sub.score}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${sub.score >= 5 ? 'passed' : 'failed'}`}>
                                {sub.score >= 5 ? 'Đạt' : 'Không đạt'}
                              </span>
                            </td>
                            <td>
                              {sub.submitted_at
                                ? new Date(sub.submitted_at).toLocaleString()
                                : '-'}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button className="edit-btn-small" onClick={() => openApproveModal(sub)} title="Chỉnh sửa / Phê duyệt">
                                  <FaEdit />
                                </button>
                                <button 
                                  className="remove-btn-small" 
                                  onClick={() => handleRemoveSubmission(sub.id)}
                                  disabled={removingSubmissionId === sub.id}
                                  title="Xóa bài nộp"
                                >
                                  {removingSubmissionId === sub.id ? <div className="mini-spinner"></div> : <FaTrash />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* APPROVE SUBMISSION MODAL */}
      {approveModalOpen && (
        <div className="custom-modal-overlay" onClick={() => setApproveModalOpen(false)}>
          <div className="custom-modal" onClick={e => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2><FaEdit /> Chỉnh sửa bài nộp</h2>
              <button className="close-modal-btn" onClick={() => setApproveModalOpen(false)}>
                <FaArrowLeft /> Hủy
              </button>
            </div>
            <form className="custom-modal-body" onSubmit={handleApproveSubmission}>
              <div className="form-group">
                <label>Điểm số (0-10)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="10" 
                  value={approveForm.score} 
                  onChange={e => setApproveForm({...approveForm, score: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Ghi chú của giáo viên (Tùy chọn)</label>
                <textarea 
                  rows={3} 
                  value={approveForm.teacher_note} 
                  onChange={e => setApproveForm({...approveForm, teacher_note: e.target.value})} 
                  placeholder="Nhận xét bài làm..."
                />
              </div>
              <div className="modal-actions-row">
                <button type="submit" className="save-btn" disabled={isApproving}>
                  {isApproving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .class-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* CUSTOM MODAL FOR APPROVAL */
        .custom-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .custom-modal {
          background: white; border-radius: 12px; width: 400px; max-width: 90vw;
          padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .custom-modal-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
        }
        .custom-modal-header h2 { font-size: 18px; margin: 0; display: flex; align-items: center; gap: 8px; }
        .close-modal-btn { background: none; border: none; cursor: pointer; color: #6b7280; font-size: 14px; display: flex; align-items: center; gap: 4px; }
        .close-modal-btn:hover { color: #1f2937; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #374151; }
        .form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1.5px solid #e5e7eb; border-radius: 8px; box-sizing: border-box; }
        .form-group input:focus, .form-group textarea:focus { border-color: #667eea; outline: none; }
        .modal-actions-row { display: flex; justify-content: flex-end; margin-top: 24px; }
        .save-btn { background: #10b981; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .remove-btn-small { background: #fef2f2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .remove-btn-small:hover { background: #ef4444; color: white; }
        .edit-btn-small { background: #eff6ff; color: #3b82f6; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; margin-right: 6px; }
        .edit-btn-small:hover { background: #3b82f6; color: white; }

        /* Class Avatar */
        .class-detail-avatar-wrap {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          margin-right: 16px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .class-detail-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
        }

        .class-detail-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 26px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .avatar-upload-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          opacity: 0;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .class-detail-avatar-wrap:hover .avatar-upload-overlay {
          opacity: 1;
        }

        .mini-spinner-white {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Header */
        .class-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          color: white;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .class-title h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .class-id {
          opacity: 0.8;
          font-size: 14px;
          display: block;
          margin-top: 4px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .edit-title-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 6px;
          color: white;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .edit-title-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .edit-name-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .edit-name-input {
          padding: 8px 12px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 24px;
          font-weight: 700;
          outline: none;
          min-width: 300px;
        }

        .edit-name-input:focus {
          border-color: white;
          background: rgba(255, 255, 255, 0.2);
        }

        .edit-actions {
          display: flex;
          gap: 8px;
        }

        .save-btn, .cancel-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-btn {
          background: #10b981;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #059669;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .cancel-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .mini-spinner-white {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .class-code-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .code-label {
          font-weight: 500;
        }

        .code-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
        }

        .code-text {
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }

        .copy-btn {
          padding: 6px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-card.primary {
          border-left: 4px solid #3b82f6;
        }

        .stat-card.success {
          border-left: 4px solid #10b981;
        }

        .stat-card.warning {
          border-left: 4px solid #f59e0b;
        }

        .stat-card.info {
          border-left: 4px solid #8b5cf6;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 20px;
        }

        .stat-card.primary .stat-icon {
          background: #eff6ff;
          color: #3b82f6;
        }

        .stat-card.success .stat-icon {
          background: #d1fae5;
          color: #10b981;
        }

        .stat-card.warning .stat-icon {
          background: #fef3c7;
          color: #f59e0b;
        }

        .stat-card.info .stat-icon {
          background: #f3e8ff;
          color: #8b5cf6;
        }

        .stat-content h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-content p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        /* Tabs */
        .tab-navigation {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: white;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .tab-btn:hover {
          background: #f9fafb;
        }

        .tab-btn.active {
          background: #3b82f6;
          color: white;
        }

        /* Tab Content */
        .tab-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          overflow: hidden;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .content-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1f2937;
        }

        .search-filter {
          display: flex;
          gap: 12px;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
        }

        .search-box input {
          padding: 10px 12px 10px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          width: 250px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .search-box input:focus {
          border-color: #3b82f6;
        }

        .filter-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
        }

        .filter-box select {
          padding: 10px 12px 10px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          outline: none;
          cursor: pointer;
        }

        /* Buttons */
        .create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .create-btn:hover {
          background: #059669;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .export-btn:hover {
          background: #4f46e5;
        }

        /* Overview */
        .overview-content {
          padding: 24px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .overview-card {
          padding: 24px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .overview-card h3 {
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1f2937;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-weight: 500;
          color: #6b7280;
        }

        .info-value {
          font-weight: 600;
          color: #1f2937;
        }

        .code-value {
          font-family: 'Courier New', monospace;
          background: #eff6ff;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .recent-activities {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 6px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          margin: 0;
          color: #1f2937;
        }

        .activity-time {
          font-size: 12px;
          color: #9ca3af;
        }

        .activity-score {
          display: flex;
          align-items: center;
        }

        .score {
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
        }

        .score.passed {
          background: #d1fae5;
          color: #065f46;
        }

        .score.failed {
          background: #fee2e2;
          color: #991b1b;
        }

        /* Students Grid */
        .students-content {
          padding: 24px;
        }

        .students-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .student-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .student-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .student-avatar {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 8px;
        }

        .student-info {
          flex: 1;
        }

        .student-info h4 {
          margin: 0;
          color: #1f2937;
        }

        .student-info p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .remove-btn {
          padding: 8px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          background: #fecaca;
        }

        /* Exams Grid */
        .exams-content {
          padding: 24px;
        }

        .exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 16px;
        }

        .exam-card {
          padding: 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .exam-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .exam-header {
          margin-bottom: 16px;
        }

        .exam-header h4 {
          margin: 0 0 8px 0;
          color: #1f2937;
        }

        .exam-duration {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 14px;
        }

        .exam-actions {
          display: flex;
          gap: 8px;
        }

        .view-btn, .edit-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .view-btn {
          background: #eff6ff;
          color: #3b82f6;
        }

        .view-btn:hover {
          background: #dbeafe;
        }

        .edit-btn {
          background: #fef3c7;
          color: #d97706;
        }

        .edit-btn:hover {
          background: #fed7aa;
        }

        /* Submissions Table */
        .submissions-content {
          padding: 0;
        }

        .submissions-table-wrapper {
          overflow-x: auto;
        }

        .submissions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .submissions-table th {
          text-align: left;
          padding: 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
        }

        .submissions-table td {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .student-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .student-icon {
          color: #3b82f6;
        }

        .score-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 12px;
        }

        .score-badge.passed,
        .status-badge.passed {
          background: #d1fae5;
          color: #065f46;
        }

        .score-badge.failed,
        .status-badge.failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }

        .view-btn-small,
        .download-btn-small {
          padding: 6px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-btn-small {
          background: #eff6ff;
          color: #3b82f6;
        }

        .download-btn-small {
          background: #f3e8ff;
          color: #8b5cf6;
        }

        /* Loading and Empty States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .mini-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #dc2626;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .not-found {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .not-found-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .not-found h2 {
          margin: 0 0 8px 0;
          color: #374151;
        }

        .not-found p {
          margin: 0;
        }

        /* Error Message */
        .error-message {
          padding: 16px;
          background: #fee2e2;
          color: #991b1b;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
        }

        /* Toast Notifications */
        .toast-success,
        .toast-error {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .toast-success {
          background: #10b981;
        }

        .toast-error {
          background: #ef4444;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .class-detail-container {
            padding: 12px;
          }

          .class-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .header-left {
            flex-direction: column;
            gap: 12px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tab-navigation {
            flex-wrap: wrap;
          }

          .tab-btn {
            flex: 1;
            min-width: 120px;
          }

          .content-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .search-filter {
            flex-direction: column;
          }

          .search-box input {
            width: 100%;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .students-grid {
            grid-template-columns: 1fr;
          }

          .exams-grid {
            grid-template-columns: 1fr;
          }

          .submissions-table-wrapper {
            margin: 0 -12px;
          }

          .submissions-table {
            font-size: 14px;
          }

          .submissions-table th,
          .submissions-table td {
            padding: 12px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ClassDetail;
