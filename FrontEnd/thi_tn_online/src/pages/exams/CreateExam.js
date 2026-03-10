import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./CreateExam.css";
import { listSubjects, createSubject } from "../../api/subjects";
import { createExam, createQuestion } from "../../api/exams";

const emptyQuestion = () => ({
  content: "",
  options: ["", "", "", ""],
  correctIndex: null,
});

const CreateExam = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const initialClassId = state.classId || null;

  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(15);
  const [maxAttempts, setMaxAttempts] = useState("");
  const [subject, setSubject] = useState(subjectId || "");
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        let data = await listSubjects();
        let list = data || [];
        if (!list.length) {
          const created = await createSubject({ name: "Chung" });
          list = [created];
        }
        setSubjects(list);
        setSubject(String(list[0].id));
      } catch {
        setError("Không tải được môn mặc định cho đề thi.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, []);

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

  const handleSubmit = async () => {
    const newFieldErrors = {};

    if (!examTitle.trim()) {
      newFieldErrors.title = "Vui lòng nhập tên đề thi.";
    }
    if (!subject) {
      newFieldErrors.subject =
        "Không tìm thấy môn học mặc định cho đề thi.";
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
        subject: newFieldErrors.subject,
        maxAttempts: newFieldErrors.maxAttempts,
        questions: questionErrors,
      });
      setError("Vui lòng kiểm tra lại các trường bị đánh dấu đỏ.");
      return;
    }

    setFieldErrors({});

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

    const payload = {
      title: examTitle.trim(),
      duration: Number(duration) || 0,
      subject: Number(subject),
      exam_class: initialClassId ? Number(initialClassId) : null,
      max_attempts:
        maxAttempts === "" ? null : Number(maxAttempts) || null,
    };

    setSaving(true);
    setError("");

    try {
      const exam = await createExam(payload);

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

      alert("Đã tạo đề thi thành công.");
      if (initialClassId) {
        navigate(`/classes/${initialClassId}`);
      }
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

  return (
    <div className="create-exam-container">
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
            <div className="field-error-text">{fieldErrors.title}</div>
          )}
        </div>

        <div className="header-meta">
          <div className="meta-field">
            <span>Thời gian (phút)</span>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="meta-field">
            <span>Số lần làm tối đa</span>
            <input
              type="number"
              placeholder="Để trống = không giới hạn"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              className={fieldErrors.maxAttempts ? "input-error" : ""}
              style={{ width: 140 }}
            />
            {fieldErrors.maxAttempts && (
              <div className="field-error-text small">
                {fieldErrors.maxAttempts}
              </div>
            )}
          </div>

          <button
            className="save-btn primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu đề thi"}
          </button>
        </div>
      </div>

      {error && <div className="create-exam-error">{error}</div>}

      <div className="create-exam-layout">
        <div className="question-sidebar">
          <div className="sidebar-header">
            <span>Câu hỏi</span>
            <button onClick={addQuestion}>+ Thêm câu</button>
          </div>
          <div className="sidebar-list">
            {questions.map((q, idx) => {
              const qErr =
                fieldErrors.questions && fieldErrors.questions[idx]
                  ? fieldErrors.questions[idx]
                  : {};
              const invalid =
                qErr.content || qErr.options || qErr.correct;
              return (
                <div
                  key={idx}
                  className={`sidebar-item ${
                    idx === activeIndex ? "active" : ""
                  } ${invalid ? "invalid" : ""}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <span>Câu {idx + 1}</span>
                  {invalid && <span className="dot" />}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`question-editor ${
            hasCurrentError ? "question-error" : ""
          }`}
        >
          <div className="question-header">
            <h4>
              Câu {activeIndex + 1}{" "}
              {hasCurrentError && (
                <span className="question-warning">(Thiếu thông tin)</span>
              )}
            </h4>
            {questions.length > 1 && (
              <button
                className="delete-btn"
                onClick={() => removeQuestion(activeIndex)}
              >
                Xoá câu hỏi
              </button>
            )}
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
            <div className="field-error-text">{currentErrors.content}</div>
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
              </div>
            ))}
          </div>

          {currentErrors.options && (
            <div className="field-error-text">{currentErrors.options}</div>
          )}
          {currentErrors.correct && (
            <div className="field-error-text">{currentErrors.correct}</div>
          )}

          <div className="question-footer">
            <button
              className="nav-btn"
              onClick={() =>
                setActiveIndex((idx) => Math.max(0, idx - 1))
              }
              disabled={activeIndex === 0}
            >
              ← Câu trước
            </button>
            <button
              className="nav-btn"
              onClick={() =>
                setActiveIndex((idx) =>
                  Math.min(questions.length - 1, idx + 1)
                )
              }
              disabled={activeIndex === questions.length - 1}
            >
              Câu tiếp →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;