import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBook, FaPlus, FaEdit, FaTrash, FaTimes, FaSave,
  FaExclamationTriangle, FaSearch, FaArrowLeft,
  FaClipboardList, FaClock, FaEye, FaChalkboardTeacher
} from "react-icons/fa";
import { getSubjects, createSubject, updateSubject, deleteSubject, getExamsBySubject } from "../../api/admin";
import "./SubjectManagement.css";

const SubjectManagement = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Chi tiết môn học
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectExams, setSubjectExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => showToast("Không thể tải danh sách môn học.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    setLoadingExams(true);
    try {
      const exams = await getExamsBySubject(subject.id);
      setSubjectExams(exams || []);
    } catch {
      showToast("Không thể tải danh sách bài thi.", "error");
    } finally {
      setLoadingExams(false);
    }
  };

  const handleBack = () => {
    setSelectedSubject(null);
    setSubjectExams([]);
  };

  const openCreate = () => {
    setEditTarget(null);
    setFormName("");
    setShowForm(true);
  };

  const openEdit = (subject, e) => {
    e.stopPropagation();
    setEditTarget(subject);
    setFormName(subject.name);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updateSubject(editTarget.id, { name: formName.trim() });
        setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        if (selectedSubject?.id === updated.id) setSelectedSubject(updated);
        showToast("Cập nhật môn học thành công!");
      } else {
        const created = await createSubject({ name: formName.trim() });
        setSubjects((prev) => [...prev, created]);
        showToast("Thêm môn học thành công!");
      }
      setShowForm(false);
    } catch {
      showToast("Lỗi, vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubject(deleteTarget.id);
      setSubjects((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      if (selectedSubject?.id === deleteTarget.id) handleBack();
      setDeleteTarget(null);
      showToast("Đã xóa môn học.");
    } catch {
      showToast("Xóa thất bại.", "error");
    }
  };

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.class_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // ─── DETAIL VIEW ─────────────────────────────────────────────────
  if (selectedSubject) {
    return (
      <div className="subject-mgmt">
        {/* DETAIL HEADER */}
        <div className="sm-header">
          <div className="sm-header-left">
            <button className="sm-back-btn" onClick={handleBack}>
              <FaArrowLeft /> Quay lại
            </button>
            <div className="sm-header-icon"><FaBook /></div>
            <div>
              <h1>{selectedSubject.name}</h1>
              <p>
                {selectedSubject.class_name
                  ? <><FaChalkboardTeacher style={{ marginRight: 4 }} />{selectedSubject.class_name}</>
                  : "Chưa gắn với lớp nào"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="sm-btn sm-btn--ghost"
              onClick={(e) => openEdit(selectedSubject, e)}
            >
              <FaEdit /> Sửa tên
            </button>
            <button
              className="sm-btn sm-btn--danger"
              onClick={() => setDeleteTarget(selectedSubject)}
            >
              <FaTrash /> Xóa môn
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="sm-detail-stats">
          <div className="sm-stat-card">
            <FaClipboardList className="sm-stat-icon" />
            <div>
              <div className="sm-stat-value">{subjectExams.length}</div>
              <div className="sm-stat-label">Bài thi</div>
            </div>
          </div>
          <div className="sm-stat-card">
            <FaChalkboardTeacher className="sm-stat-icon" />
            <div>
              <div className="sm-stat-value">{selectedSubject.class_name || "—"}</div>
              <div className="sm-stat-label">Lớp học</div>
            </div>
          </div>
        </div>

        {/* EXAM LIST */}
        <div className="sm-section">
          <div className="sm-section-header">
            <h2><FaClipboardList /> Danh sách bài thi</h2>
            <button
              className="sm-btn sm-btn--primary"
              onClick={() =>
                navigate("/exams/create", {
                  state: {
                    subjectId: selectedSubject.id,
                    subjectName: selectedSubject.name,
                    classId: selectedSubject.class_obj,
                  },
                })
              }
            >
              <FaPlus /> Tạo bài thi mới
            </button>
          </div>

          {loadingExams ? (
            <div className="sm-loading"><div className="sm-spinner" /><span>Đang tải...</span></div>
          ) : subjectExams.length === 0 ? (
            <div className="sm-empty">
              <FaClipboardList />
              <span>Môn học này chưa có bài thi nào.</span>
            </div>
          ) : (
            <div className="sm-exam-list">
              {subjectExams.map((exam) => (
                <div key={exam.id} className="sm-exam-card">
                  <div className="sm-exam-info">
                    <div className="sm-exam-title">{exam.title}</div>
                    <div className="sm-exam-meta">
                      <span><FaClock /> {exam.duration} phút</span>
                      {exam.max_attempts && (
                        <span>Giới hạn: {exam.max_attempts} lần</span>
                      )}
                      {exam.due_date && (
                        <span>Hạn nộp: {new Date(exam.due_date).toLocaleDateString("vi-VN")}</span>
                      )}
                    </div>
                  </div>
                  <div className="sm-exam-actions">
                    <button
                      className="sm-action-btn sm-action-btn--view"
                      onClick={() => navigate(`/exam/${exam.id}`)}
                      title="Xem / Thi"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="sm-action-btn sm-action-btn--edit"
                      onClick={() => navigate(`/exams/${exam.id}/edit`)}
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODALS */}
        {showForm && (
          <div className="sm-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sm-modal-header">
                <div className="sm-modal-title"><FaEdit /><span>Chỉnh sửa môn học</span></div>
                <button className="sm-modal-close" onClick={() => setShowForm(false)}><FaTimes /></button>
              </div>
              <form className="sm-modal-form" onSubmit={handleSubmit}>
                <div className="sm-form-group">
                  <label>Tên môn học</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Toán, Vật lý, Hóa học..."
                    autoFocus
                    required
                  />
                </div>
                <div className="sm-modal-actions">
                  <button type="button" className="sm-btn sm-btn--ghost" onClick={() => setShowForm(false)}>Hủy</button>
                  <button type="submit" className="sm-btn sm-btn--primary" disabled={saving}>
                    <FaSave />{saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="sm-modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="sm-modal sm-modal--sm" onClick={(e) => e.stopPropagation()}>
              <div className="sm-modal-header">
                <div className="sm-modal-title sm-modal-title--danger"><FaExclamationTriangle /><span>Xác nhận xóa</span></div>
                <button className="sm-modal-close" onClick={() => setDeleteTarget(null)}><FaTimes /></button>
              </div>
              <div className="sm-delete-body">
                <p>Xóa môn học <strong>"{deleteTarget.name}"</strong>?<br />
                  <span className="sm-warning-text">Tất cả bài thi trong môn cũng sẽ bị xóa. Hành động này không thể hoàn tác.</span>
                </p>
                <div className="sm-modal-actions">
                  <button className="sm-btn sm-btn--ghost" onClick={() => setDeleteTarget(null)}>Hủy</button>
                  <button className="sm-btn sm-btn--danger" onClick={handleDelete}><FaTrash /> Xóa</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={`sm-toast sm-toast--${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  // ─── LIST VIEW ────────────────────────────────────────────────────
  return (
    <div className="subject-mgmt">
      {/* HEADER */}
      <div className="sm-header">
        <div className="sm-header-left">
          <div className="sm-header-icon"><FaBook /></div>
          <div>
            <h1>Quản lý môn học</h1>
            <p>{subjects.length} môn học</p>
          </div>
        </div>
        <button className="sm-btn-add" onClick={openCreate}>
          <FaPlus /> Thêm môn học
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="sm-search-bar">
        <FaSearch className="sm-search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên môn học hoặc tên lớp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="sm-loading"><div className="sm-spinner" /><span>Đang tải...</span></div>
      ) : (
        <div className="sm-grid">
          {filteredSubjects.length === 0 ? (
            <div className="sm-empty">
              <FaBook />
              <span>Không tìm thấy môn học nào.</span>
            </div>
          ) : (
            filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                className="sm-card sm-card--clickable"
                onClick={() => handleSelectSubject(subject)}
              >
                <div className="sm-card-icon"><FaBook /></div>
                <div className="sm-card-body">
                  <div className="sm-card-name">{subject.name}</div>
                  {subject.class_name && (
                    <div className="sm-card-class">
                      <FaChalkboardTeacher /> {subject.class_name}
                    </div>
                  )}
                  <div className="sm-card-meta">
                    <FaClipboardList /> {subject.exam_count ?? 0} bài thi
                  </div>
                </div>
                <div className="sm-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="sm-action-btn sm-action-btn--edit"
                    onClick={(e) => openEdit(subject, e)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="sm-action-btn sm-action-btn--delete"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(subject); }}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="sm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sm-modal-header">
              <div className="sm-modal-title">
                {editTarget ? <FaEdit /> : <FaPlus />}
                <span>{editTarget ? "Chỉnh sửa môn học" : "Thêm môn học"}</span>
              </div>
              <button className="sm-modal-close" onClick={() => setShowForm(false)}><FaTimes /></button>
            </div>
            <form className="sm-modal-form" onSubmit={handleSubmit}>
              <div className="sm-form-group">
                <label>Tên môn học</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Toán, Vật lý, Hóa học..."
                  autoFocus
                  required
                />
              </div>
              <div className="sm-modal-actions">
                <button type="button" className="sm-btn sm-btn--ghost" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="sm-btn sm-btn--primary" disabled={saving}>
                  <FaSave />{saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="sm-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="sm-modal sm-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="sm-modal-header">
              <div className="sm-modal-title sm-modal-title--danger">
                <FaExclamationTriangle /> <span>Xác nhận xóa</span>
              </div>
              <button className="sm-modal-close" onClick={() => setDeleteTarget(null)}><FaTimes /></button>
            </div>
            <div className="sm-delete-body">
              <p>
                Xóa môn học <strong>"{deleteTarget.name}"</strong>?<br />
                <span className="sm-warning-text">Tất cả bài thi trong môn cũng sẽ bị xóa. Hành động này không thể hoàn tác.</span>
              </p>
              <div className="sm-modal-actions">
                <button className="sm-btn sm-btn--ghost" onClick={() => setDeleteTarget(null)}>Hủy</button>
                <button className="sm-btn sm-btn--danger" onClick={handleDelete}><FaTrash /> Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`sm-toast sm-toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default SubjectManagement;
