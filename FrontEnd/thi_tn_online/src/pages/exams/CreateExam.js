import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CreateExam.css";
import { createExam, createQuestion } from "../../api/exams";

const emptyQuestion = () => ({
  content: "",
  options: ["", "", "", ""],
  correctIndex: null,
});

const CreateExam = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const initialClassId = state.classId || null;

  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(15);
  const [maxAttempts, setMaxAttempts] = useState("");
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
        exam_class: initialClassId ? Number(initialClassId) : null,
        max_attempts:
          maxAttempts === "" ? null : Number(maxAttempts) || null,
      };

      const exam = await createExam(payload);

      // Convert questions to backend format
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
      }));

      // create questions
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
          navigate(`/classes/${initialClassId}`);
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
          <div className="success-icon">✓</div>
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
              <span>⚠️</span> {fieldErrors.title}
            </div>
          )}
        </div>

        <div className="header-meta">
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
                <span>⚠️</span> {fieldErrors.maxAttempts}
              </div>
            )}
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
                <span>💾</span>
                Lưu đề thi
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="create-exam-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="create-exam-layout">
        <div className="question-sidebar">
          <div className="sidebar-header">
            <span>📝 Câu hỏi ({completedQuestions}/{questions.length})</span>
            <button onClick={addQuestion}>
              <span>➕</span> Thêm câu
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
                  <span>
                    {isCompleted ? "✅" : invalid ? "❌" : "⭕"} Câu {idx + 1}
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
                      📋
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
                        🗑️
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
              <span>📝</span>
              Câu {activeIndex + 1}{" "}
              {hasCurrentError && (
                <span className="question-warning">(⚠️ Cần hoàn thiện)</span>
              )}
            </h4>
            <div className="question-actions-header">
              <button
                className="action-btn"
                onClick={() => duplicateQuestion(activeIndex)}
                title="Sao chép câu hỏi"
              >
                📋 Sao chép
              </button>
              {questions.length > 1 && (
                <button
                  className="delete-btn"
                  onClick={() => removeQuestion(activeIndex)}
                  title="Xóa câu hỏi"
                >
                  <span>🗑️</span> Xóa câu hỏi
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
              <span>⚠️</span> {currentErrors.content}
            </div>
          )}

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
                  placeholder={`Đáp án ${String.fromCharCode(
                    65 + optIndex
                  )}`}
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(
                      activeIndex,
                      optIndex,
                      e.target.value
                    )
                  }
                />
                <span className="option-label">
                  {String.fromCharCode(65 + optIndex)}
                </span>
              </div>
            ))}
          </div>

          {currentErrors.options && (
            <div className="field-error-text">
              <span>⚠️</span> {currentErrors.options}
            </div>
          )}
          {currentErrors.correct && (
            <div className="field-error-text">
              <span>⚠️</span> {currentErrors.correct}
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
              <span>⬅️</span> Câu trước
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
              Câu tiếp <span>➡️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
