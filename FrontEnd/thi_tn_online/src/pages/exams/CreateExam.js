import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaArrowRight, FaSave, FaPlus, FaTrash,
  FaCopy, FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaCircle, FaBook, FaCalendarAlt, FaImage, FaTimes,
  FaFileAlt, FaCheck
} from "react-icons/fa";
import "./CreateExam.css";
import { createExam, createQuestion } from "../../api/exams";

const emptyQuestion = () => ({
  content: "",
  options: ["", "", "", ""],
  correctIndex: null,
  imageFile: null,
  imagePreview: null,
});

const CreateExam = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const initialClassId = state.classId || null;
  const initialSubjectId = state.subjectId || null;
  const subjectName = state.subjectName || null;

  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(15);
  const [maxAttempts, setMaxAttempts] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].content = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = optIndex;
    setQuestions(updated);
  };

  const handleImageChange = (qIndex, file) => {
    if (!file) return;
    const updated = [...questions];
    updated[qIndex].imageFile = file;
    updated[qIndex].imagePreview = URL.createObjectURL(file);
    setQuestions(updated);
  };

  const handleRemoveImage = (qIndex) => {
    const updated = [...questions];
    if (updated[qIndex].imagePreview) URL.revokeObjectURL(updated[qIndex].imagePreview);
    updated[qIndex].imageFile = null;
    updated[qIndex].imagePreview = null;
    setQuestions(updated);
  };

  const addQuestion = () => {
    const updated = [...questions, emptyQuestion()];
    setQuestions(updated);
    setActiveIndex(updated.length - 1);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (activeIndex >= updated.length) {
      setActiveIndex(updated.length - 1);
    }
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = questions[index];
    const newQuestion = {
      ...questionToDuplicate,
      content: questionToDuplicate.content + " (Bản sao)",
      correctIndex: null,
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, newQuestion);
    setQuestions(updated);
    setActiveIndex(index + 1);
  };

  const handleSubmit = async () => {
    const newFieldErrors = {};

    if (!examTitle.trim()) {
      newFieldErrors.title = "Vui lòng nhập tên đề thi.";
    }

    if (maxAttempts !== "") {
      const n = Number(maxAttempts);
      if (!Number.isInteger(n) || n <= 0) {
        newFieldErrors.maxAttempts = "Số lần làm tối đa phải là số nguyên > 0.";
      }
    }

    const questionErrors = questions.map((q) => {
      const err = {};
      if (!q.content.trim()) {
        err.content = "Nội dung câu hỏi không được để trống.";
      }

      const filledOptions = q.options.filter((o) => o.trim() !== "");
      if (filledOptions.length < 2) {
        err.options = "Cần ít nhất 2 đáp án có nội dung.";
      }
      if (q.correctIndex == null) {
        err.correct = "Hãy chọn đáp án đúng.";
      }
      return err;
    });

    const hasQuestionError = questionErrors.some(
      (qe) => qe.content || qe.options || qe.correct
    );

    if (Object.keys(newFieldErrors).length > 0 || hasQuestionError) {
      setFieldErrors({
        title: newFieldErrors.title,
        maxAttempts: newFieldErrors.maxAttempts,
        questions: questionErrors,
      });
      setError("Vui lòng kiểm tra lại các trường bị đánh dấu đỏ.");
      return;
    }

    setFieldErrors({});
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: examTitle.trim(),
        duration: Number(duration) || 0,
        subject: initialSubjectId ? Number(initialSubjectId) : null,
        exam_class: !initialSubjectId && initialClassId ? Number(initialClassId) : null,
        max_attempts:
          maxAttempts === "" ? null : Number(maxAttempts) || null,
        due_date: dueDate || null,
      };

      const exam = await createExam(payload);

      const payloadQuestions = questions.map((q) => ({
        question_text: q.content,
        option_a: q.options[0] || "",
        option_b: q.options[1] || "",
        option_c: q.options[2] || "",
        option_d: q.options[3] || "",
        correct_answer:
          q.correctIndex != null
            ? String.fromCharCode(65 + q.correctIndex)
            : "A",
        image: q.imageFile || null,
      }));

      if (payloadQuestions.length > 0) {
        for (const q of payloadQuestions) {
          // eslint-disable-next-line no-await-in-loop
          await createQuestion({
            examId: exam.id,
            question: {
              ...q,
              exam: exam.id,
            },
          });
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (initialClassId) {
          navigate(`/classes/${initialClassId}`, { state: { defaultTab: 'subjects' } });
        } else {
          navigate('/exams');
        }
      }, 2000);

    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Tạo đề thi thất bại. Vui lòng kiểm tra lại dữ liệu.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const currentQuestion = questions[activeIndex] || questions[0];
  const currentErrors =
    fieldErrors.questions && fieldErrors.questions[activeIndex]
      ? fieldErrors.questions[activeIndex]
      : {};
  const hasCurrentError =
    currentErrors.content || currentErrors.options || currentErrors.correct;

  const completedQuestions = questions.filter(q =>
    q.content.trim() &&
    q.options.filter(o => o.trim()).length >= 2 &&
    q.correctIndex !== null
  ).length;

  return (
    <div className="create-exam-container">
      {saving && (
        <div className="saving-overlay">
          <div className="saving-spinner"></div>
        </div>
      )}

      {showSuccess && (
        <div className="success-message">
          <div className="success-icon"><FaCheck /></div>
          <div>
            <strong>Đã tạo đề thi thành công!</strong>
            <p>Đang chuyển hướng...</p>
          </div>
        </div>
      )}

      <div className="create-exam-header">
        <div className="header-main">
          <input
            type="text"
            placeholder="Nhập tiêu đề đề thi (ví dụ: Kiểm tra 15 phút Chương 1)"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            className={fieldErrors.title ? "input-error large" : "large"}
          />
          {fieldErrors.title && (
            <div className="field-error-text">
              <FaExclamationTriangle /> {fieldErrors.title}
            </div>
          )}
        </div>

        <div className="header-meta">
          <button
            className="cancel-btn"
            onClick={() => initialClassId ? navigate(`/classes/${initialClassId}`) : navigate('/exams')}
            disabled={saving}
          >
            <FaArrowLeft /> Hủy bỏ
          </button>

          {subjectName && (
            <div className="meta-field" style={{ background: 'var(--primary-light, #e8f4ff)', borderRadius: 8, padding: '6px 14px' }}>
              <FaBook style={{ marginRight: 6, color: '#3b82f6' }} />
              <span style={{ fontSize: 13, color: '#555' }}>Môn học: <strong>{subjectName}</strong></span>
            </div>
          )}

          <div className="meta-field">
            <label>Thời gian (phút)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="300"
            />
          </div>

          <div className="meta-field">
            <label>Số lần làm tối đa</label>
            <input
              type="number"
              placeholder="Để trống = không giới hạn"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              className={fieldErrors.maxAttempts ? "input-error" : ""}
              min="1"
              max="100"
            />
            {fieldErrors.maxAttempts && (
              <div className="field-error-text small">
                <FaExclamationTriangle /> {fieldErrors.maxAttempts}
              </div>
            )}
          </div>

          <div className="meta-field deadline-field">
            <label><FaCalendarAlt style={{ marginRight: 6 }} />Hạn chót nộp bài</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              title="Sau thời gian này học sinh không thể nộp bài"
            />
          </div>

          <button
            className="save-btn primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave />
                Lưu đề thi
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="create-exam-error">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <div className="create-exam-layout">
        <div className="question-sidebar">
          <div className="sidebar-header">
            <span><FaFileAlt style={{ marginRight: 6 }} />Câu hỏi ({completedQuestions}/{questions.length})</span>
            <button onClick={addQuestion}>
              <FaPlus /> Thêm câu
            </button>
          </div>

          <div className="sidebar-list">
            {questions.map((q, idx) => {
              const qErr =
                fieldErrors.questions && fieldErrors.questions[idx]
                  ? fieldErrors.questions[idx]
                  : {};
              const invalid =
                qErr.content || qErr.options || qErr.correct;
              const isCompleted = q.content.trim() &&
                q.options.filter(o => o.trim()).length >= 2 &&
                q.correctIndex !== null;

              return (
                <div
                  key={idx}
                  className={`sidebar-item ${
                    idx === activeIndex ? "active" : ""
                  } ${invalid ? "invalid" : ""} ${!isCompleted && idx !== activeIndex ? "incomplete" : ""}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <span className="sidebar-item-label">
                    {isCompleted
                      ? <FaCheckCircle className="icon-done" />
                      : invalid
                        ? <FaTimesCircle className="icon-error" />
                        : <FaCircle className="icon-pending" />
                    }
                    Câu {idx + 1}
                  </span>
                  <div className="question-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateQuestion(idx);
                      }}
                      title="Sao chép câu hỏi"
                      className="action-btn"
                    >
                      <FaCopy />
                    </button>
                    {questions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(idx);
                        }}
                        title="Xóa câu hỏi"
                        className="action-btn delete"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  {invalid && <span className="dot" />}
                </div>
              );
            })}
          </div>

          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-label">Hoàn thành:</span>
              <span className="stat-value">{completedQuestions}/{questions.length}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completedQuestions / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div
          className={`question-editor ${
            hasCurrentError ? "question-error" : ""
          }`}
        >
          <div className="question-header">
            <h4>
              <FaFileAlt style={{ marginRight: 8 }} />
              Câu {activeIndex + 1}{" "}
              {hasCurrentError && (
                <span className="question-warning">
                  <FaExclamationTriangle /> Cần hoàn thiện
                </span>
              )}
            </h4>
            <div className="question-actions-header">
              <button
                className="action-btn"
                onClick={() => duplicateQuestion(activeIndex)}
                title="Sao chép câu hỏi"
              >
                <FaCopy /> Sao chép
              </button>
              {questions.length > 1 && (
                <button
                  className="delete-btn"
                  onClick={() => removeQuestion(activeIndex)}
                  title="Xóa câu hỏi"
                >
                  <FaTrash /> Xóa câu hỏi
                </button>
              )}
            </div>
          </div>

          <textarea
            placeholder="Nhập nội dung câu hỏi..."
            value={currentQuestion.content}
            onChange={(e) =>
              handleQuestionChange(activeIndex, e.target.value)
            }
            className={currentErrors.content ? "input-error" : ""}
          />
          {currentErrors.content && (
            <div className="field-error-text">
              <FaExclamationTriangle /> {currentErrors.content}
            </div>
          )}

          {/* Image upload */}
          <div className="image-upload-section">
            {currentQuestion.imagePreview ? (
              <div className="image-preview-wrapper">
                <img src={currentQuestion.imagePreview} alt="Ảnh câu hỏi" className="image-preview" />
                <button
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage(activeIndex)}
                  title="Xóa ảnh"
                >
                  <FaTimes /> Xóa ảnh
                </button>
              </div>
            ) : (
              <label className="image-upload-label">
                <FaImage style={{ marginRight: 8 }} /> Thêm ảnh minh họa (không bắt buộc)
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageChange(activeIndex, e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="options">
            {currentQuestion.options.map((opt, optIndex) => (
              <div key={optIndex} className="option-row">
                <input
                  type="radio"
                  name={`correct-${activeIndex}`}
                  checked={currentQuestion.correctIndex === optIndex}
                  onChange={() =>
                    handleCorrectChange(activeIndex, optIndex)
                  }
                />
                <input
                  type="text"
                  placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(
                      activeIndex,
                      optIndex,
                      e.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>

          {currentErrors.options && (
            <div className="field-error-text">
              <FaExclamationTriangle /> {currentErrors.options}
            </div>
          )}
          {currentErrors.correct && (
            <div className="field-error-text">
              <FaExclamationTriangle /> {currentErrors.correct}
            </div>
          )}

          <div className="question-footer">
            <button
              className="nav-btn"
              onClick={() =>
                setActiveIndex((idx) => Math.max(0, idx - 1))
              }
              disabled={activeIndex === 0}
            >
              <FaArrowLeft /> Câu trước
            </button>

            <div className="question-counter">
              {activeIndex + 1} / {questions.length}
            </div>

            <button
              className="nav-btn"
              onClick={() =>
                setActiveIndex((idx) =>
                  Math.min(questions.length - 1, idx + 1)
                )
              }
              disabled={activeIndex === questions.length - 1}
            >
              Câu tiếp <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
