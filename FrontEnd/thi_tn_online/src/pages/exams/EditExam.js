import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaEdit, 
  FaSave, 
  FaArrowLeft, 
  FaClock,
  FaQuestionCircle,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaPlus,
  FaCopy,
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaList
} from "react-icons/fa";
import "./EditExam.css";
import { getExam, updateExam } from "../../api/exams";

const emptyQuestion = () => ({
  content: "",
  options: ["", "", "", ""],
  correctIndex: null,
});

const EditExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(15);
  const [maxAttempts, setMaxAttempts] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Load existing exam data
  useEffect(() => {
    const loadExam = async () => {
      try {
        const examData = await getExam(examId);
        setExamTitle(examData.title || "");
        setDuration(examData.duration || 15);
        setMaxAttempts(examData.max_attempts || "");
        
        if (examData.questions && examData.questions.length > 0) {
          setQuestions(examData.questions);
        }
      } catch (err) {
        setError("Không tải được thông tin bài thi");
        console.error("Error loading exam:", err);
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

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
      content: questionToDuplicate.content + " (Bản sao)",
      options: [...questionToDuplicate.options],
      correctIndex: null,
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, newQuestion);
    setQuestions(updated);
    setActiveIndex(index + 1);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!examTitle.trim()) {
      errors.push("Vui lòng nhập tiêu đề bài thi");
    }
    
    if (!duration || duration <= 0) {
      errors.push("Thời gian phải lớn hơn 0");
    }

    questions.forEach((q, qIndex) => {
      if (!q.content.trim()) {
        errors.push(`Câu ${qIndex + 1}: Vui lòng nhập nội dung câu hỏi`);
      }
      
      q.options.forEach((opt, optIndex) => {
        if (!opt.trim()) {
          errors.push(`Câu ${qIndex + 1}, Đáp án ${optIndex + 1}: Vui lòng nhập đầy đủ đáp án`);
        }
      });
      
      if (q.correctIndex === null || q.correctIndex === undefined) {
        errors.push(`Câu ${qIndex + 1}: Vui lòng chọn đáp án đúng`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join("\n"));
      return false;
    }
    
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const examData = {
        title: examTitle,
        duration: Number(duration),
        max_attempts: Number(maxAttempts) || null,
        questions: questions.map(q => ({
          content: q.content,
          options: q.options,
          correct_index: q.correctIndex
        }))
      };

      await updateExam(examId, examData);
      setSuccess("Cập nhật bài thi thành công!");
      
      setTimeout(() => {
        navigate(`/exam/${examId}`);
      }, 1500);
      
    } catch (err) {
      setError("Không cập nhật được bài thi");
      console.error("Update exam error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-exam-container">
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải thông tin bài thi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-exam-container">
      <div className="exam-header">
        <h2><FaEdit /> Chỉnh sửa bài thi</h2>
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Quay lại
        </button>
      </div>

      {success && (
        <div className="success-message">
          <FaCheck /> {success}
        </div>
      )}

      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="exam-form">
        <div className="exam-info">
          <div className="form-group">
            <label><FaQuestionCircle /> Tiêu đề bài thi *</label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className={error.includes("tiêu đề") ? "error" : ""}
              placeholder="Nhập tiêu đề bài thi"
              disabled={saving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FaClock /> Thời gian (phút) *</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={error.includes("Thời gian") ? "error" : ""}
                min="1"
                placeholder="15"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Số lần thử tối đa</label>
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                placeholder="Để trống nếu không giới hạn"
                min="1"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className="questions-section">
          <div className="section-header">
            <h3><FaList /> Câu hỏi</h3>
            <button type="button" className="add-question-btn" onClick={addQuestion}>
              <FaPlus /> Thêm câu hỏi
            </button>
          </div>

          <div className="questions-list">
            {questions.map((question, qIndex) => (
              <div 
                key={qIndex} 
                className={`question-editor ${activeIndex === qIndex ? "active" : ""} ${
                  error.includes(`Câu ${qIndex + 1}`) ? "question-error" : ""
                }`}
              >
                <div className="question-header">
                  <span className="question-number">Câu {qIndex + 1}</span>
                  <div className="question-actions">
                    <button 
                      type="button" 
                      className="duplicate-btn"
                      onClick={() => duplicateQuestion(qIndex)}
                      title="Nhân bản câu hỏi"
                    >
                      <FaCopy />
                    </button>
                    {questions.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-btn"
                        onClick={() => removeQuestion(qIndex)}
                        title="Xóa câu hỏi"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                <div className="question-content">
                  <textarea
                    value={question.content}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    className={error.includes(`Câu ${qIndex + 1}`) ? "error" : ""}
                    placeholder="Nhập nội dung câu hỏi..."
                    rows="3"
                    disabled={saving}
                  />
                </div>

                <div className="options-section">
                  <h4><FaList /> Đáp án</h4>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="option-item">
                      <div className="option-input-group">
                        <input
                          type="radio"
                          name={`correct_${qIndex}`}
                          checked={question.correctIndex === optIndex}
                          onChange={() => handleCorrectChange(qIndex, optIndex)}
                          disabled={saving}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          className={error.includes(`Đáp án ${optIndex + 1}`) ? "error" : ""}
                          placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="question-nav">
                  <button 
                    type="button" 
                    className="nav-btn"
                    onClick={() => setActiveIndex(Math.max(0, qIndex - 1))}
                    disabled={qIndex === 0 || saving}
                  >
                    <FaChevronUp />
                  </button>
                  <button 
                    type="button" 
                    className="nav-btn"
                    onClick={() => setActiveIndex(Math.min(questions.length - 1, qIndex + 1))}
                    disabled={qIndex === questions.length - 1 || saving}
                  >
                    <FaChevronDown />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate(-1)} disabled={saving}>
            Hủy
          </button>
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? (
              <>
                <FaSpinner className="btn-spinner" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <FaSave /> Cập nhật bài thi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExam;
