import { useState, useEffect, useCallback } from "react";
import {
  FaDatabase, FaSearch, FaPlus, FaFilter, FaEdit, FaTrash,
  FaTimes, FaSave, FaExclamationTriangle
} from "react-icons/fa";
import { getBankQuestions, createBankQuestion, updateBankQuestion, deleteBankQuestion } from "../../api/questions";
import { getSubjects } from "../../api/admin";
import "./QuestionBank.css";

const DeleteConfirmModal = ({ question, onClose, onConfirm }) => (
  <div className="qb-modal-overlay" onClick={onClose}>
    <div className="qb-modal qb-modal--sm" onClick={e => e.stopPropagation()}>
      <div className="qb-modal-header">
        <div className="qb-modal-title qb-modal-title--danger">
          <FaExclamationTriangle />
          <span>Xác nhận xóa</span>
        </div>
        <button className="qb-modal-close" onClick={onClose}><FaTimes /></button>
      </div>
      <div className="qb-delete-body">
        <p>Bạn có chắc muốn xóa câu hỏi này khỏi ngân hàng?</p>
        <p className="qb-warning-text">Hành động này không thể hoàn tác.</p>
        <div className="qb-modal-actions">
          <button className="qb-btn qb-btn--ghost" onClick={onClose}>Hủy</button>
          <button className="qb-btn qb-btn--danger" onClick={onConfirm}>
            <FaTrash /> Xóa câu hỏi
          </button>
        </div>
      </div>
    </div>
  </div>
);

const QuestionModal = ({ question, subjects, onClose, onSave }) => {
  const isEdit = !!question;
  const [form, setForm] = useState(
    question || {
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      subject: "",
      image: null
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const updated = await updateBankQuestion(question.id, form);
        onSave(updated, true);
      } else {
        const created = await createBankQuestion(form);
        onSave(created, false);
      }
    } catch (err) {
      setError("Lỗi khi lưu câu hỏi. Vui lòng kiểm tra lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="qb-modal-overlay" onClick={onClose}>
      <div className="qb-modal" onClick={e => e.stopPropagation()}>
        <div className="qb-modal-header">
          <div className="qb-modal-title">
            {isEdit ? <FaEdit /> : <FaPlus />}
            <span>{isEdit ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</span>
          </div>
          <button className="qb-modal-close" onClick={onClose}><FaTimes /></button>
        </div>
        <form className="qb-modal-form" onSubmit={handleSubmit}>
          {error && <div className="qb-error">{error}</div>}

          <div className="qb-form-group">
            <label>Nội dung câu hỏi *</label>
            <textarea
              value={form.question_text}
              onChange={e => setForm({ ...form, question_text: e.target.value })}
              required
              rows={3}
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

          <div className="qb-form-group">
            <label>Môn học (Tùy chọn)</label>
            <select
              value={form.subject || ""}
              onChange={e => setForm({ ...form, subject: e.target.value })}
            >
              <option value="">-- Không chọn --</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="qb-options-grid">
            {["a", "b", "c", "d"].map((opt) => (
              <div key={opt} className="qb-form-group">
                <label>
                  Đáp án {opt.toUpperCase()}
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={form.correct_answer === opt.toUpperCase()}
                    onChange={() => setForm({ ...form, correct_answer: opt.toUpperCase() })}
                    style={{ marginLeft: 8 }}
                  />
                  Đúng
                </label>
                <input
                  type="text"
                  value={form[`option_${opt}`]}
                  onChange={e => setForm({ ...form, [`option_${opt}`]: e.target.value })}
                  required
                  placeholder={`Nhập đáp án ${opt.toUpperCase()}...`}
                />
              </div>
            ))}
          </div>

          <div className="qb-modal-actions">
            <button type="button" className="qb-btn qb-btn--ghost" onClick={onClose} disabled={saving}>Hủy</button>
            <button type="submit" className="qb-btn qb-btn--primary" disabled={saving}>
              <FaSave /> {saving ? "Đang lưu..." : "Lưu câu hỏi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadFilterData = async () => {
    try {
      const subs = await getSubjects();
      setSubjects(subs);
    } catch {}
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (subjectFilter) params.subject_id = subjectFilter;
      const data = await getBankQuestions(params);
      setQuestions(data);
    } catch (err) {
      showToast("Không tải được danh sách câu hỏi.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, subjectFilter]);

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  const handleSave = (question, isEdit) => {
    if (isEdit) {
      setQuestions(prev => prev.map(q => q.id === question.id ? question : q));
    } else {
      setQuestions(prev => [question, ...prev]);
    }
    setShowModal(false);
    setEditTarget(null);
    showToast(isEdit ? "Cập nhật thành công!" : "Đã thêm câu hỏi mới!");
  };

  const handleDelete = async () => {
    try {
      await deleteBankQuestion(deleteTarget.id);
      setQuestions(prev => prev.filter(q => q.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Đã xóa câu hỏi.");
    } catch {
      showToast("Xóa thất bại.", "error");
    }
  };

  const getSubjectName = (subjectId) => {
    const sub = subjects.find(s => s.id === subjectId);
    return sub ? sub.name : "Chưa phân loại";
  };

  return (
    <div className="q-bank">
      <div className="qb-header">
        <div className="qb-header-title">
          <div className="qb-header-icon"><FaDatabase /></div>
          <div>
            <h1>Ngân hàng câu hỏi</h1>
            <p>{questions.length} câu hỏi dùng chung</p>
          </div>
        </div>
        <button className="qb-btn-add" onClick={() => { setEditTarget(null); setShowModal(true); }}>
          <FaPlus /> Thêm câu hỏi
        </button>
      </div>

      <div className="qb-filters">
        <div className="qb-search-wrap">
          <FaSearch className="qb-search-icon" />
          <input
            className="qb-search"
            type="text"
            placeholder="Tìm theo nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="qb-select-wrap">
          <FaFilter className="qb-filter-icon" />
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="">Tất cả môn học</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="qb-content">
        {loading ? (
          <div className="qb-loading">
            <div className="qb-spinner" />
            <span>Đang tải ngân hàng...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="qb-empty">
            <FaDatabase />
            <span>Không tìm thấy câu hỏi nào.</span>
          </div>
        ) : (
          <div className="qb-grid">
            {questions.map((q) => (
              <div key={q.id} className="qb-card">
                <div className="qb-card-header">
                  <span className="qb-subject-badge">{getSubjectName(q.subject)}</span>
                  <div className="qb-card-actions">
                    <button className="qb-action-icon edit" onClick={() => { setEditTarget(q); setShowModal(true); }}><FaEdit /></button>
                    <button className="qb-action-icon delete" onClick={() => setDeleteTarget(q)}><FaTrash /></button>
                  </div>
                </div>
                <div className="qb-card-body">
                  <p className="qb-question-text">{q.question_text}</p>
                </div>
                <div className="qb-options">
                  <div className={`qb-option ${q.correct_answer === "A" ? "correct" : ""}`}><strong>A.</strong> {q.option_a}</div>
                  <div className={`qb-option ${q.correct_answer === "B" ? "correct" : ""}`}><strong>B.</strong> {q.option_b}</div>
                  <div className={`qb-option ${q.correct_answer === "C" ? "correct" : ""}`}><strong>C.</strong> {q.option_c}</div>
                  <div className={`qb-option ${q.correct_answer === "D" ? "correct" : ""}`}><strong>D.</strong> {q.option_d}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <QuestionModal
          question={editTarget}
          subjects={subjects}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          question={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {toast && <div className={`qb-toast qb-toast--${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default QuestionBank;
