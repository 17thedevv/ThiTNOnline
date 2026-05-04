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
import { getExam, updateExam, updateQuestion, deleteQuestion, createQuestion as createExamQuestion, exportExamResults, importQuestions } from "../../api/exams";





const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const emptyQuestion = () => ({
  id: null, // null = câu mới, chưa tồn tại trên server
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
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);
  // Track câu hỏi đã xóa khỏi UI nhưng còn tồn tại trên server (có id)
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
  // Export / Import
  const [exporting, setExporting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);



  // Load existing exam data
  useEffect(() => {
    const loadExam = async () => {
      try {
        const examData = await getExam({ examId });
        setExamTitle(examData.title || "");
        setDuration(examData.duration || 15);
        setMaxAttempts(examData.max_attempts ?? "");
        
        // Format due_date for datetime-local input (YYYY-MM-DDTHH:MM)
        if (examData.due_date) {
          const date = new Date(examData.due_date);
          const formattedDate = date.toISOString().slice(0, 16);
          setDueDate(formattedDate);
        }
        
        // Transform câu hỏi từ backend format → form format
        if (examData.questions && examData.questions.length > 0) {
          const transformed = examData.questions.map((q) => ({
            id: q.id,  // giữ lại ID để PATCH đúng câu hỏi
            content: q.question_text || "",
            options: [
              q.option_a || "",
              q.option_b || "",
              q.option_c || "",
              q.option_d || "",
            ],
            correctIndex: OPTION_LETTERS.indexOf(q.correct_answer ?? "A"),
          }));
          setQuestions(transformed);
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
    const questionToRemove = questions[index];
    // Nếu câu hỏi có ID thực (tồn tại trên server) → đánh dấu để xóa khi submit
    if (questionToRemove.id) {
      setDeletedQuestionIds(prev => [...prev, questionToRemove.id]);
    }
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (activeIndex >= updated.length) {
      setActiveIndex(updated.length - 1);
    }
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = questions[index];
    const newQuestion = {
      id: null, // bản sao là câu mới
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
    setSaveProgress({ current: 0, total: deletedQuestionIds.length + questions.length + 1 });

    try {
      // 1. Cập nhật metadata bài thi
      await updateExam(examId, {
        title: examTitle,
        duration: Number(duration),
        max_attempts: Number(maxAttempts) || null,
        due_date: dueDate || null,
      });
      setSaveProgress(p => ({ ...p, current: p.current + 1 }));

      // 2. Xóa các câu hỏi đã bị remove khỏi UI trên server
      for (const qId of deletedQuestionIds) {
        try {
          await deleteQuestion(examId, qId);
        } catch (_) {
          // Bỏ qua nếu câu hỏi đã không tồn tại
        }
        setSaveProgress(p => ({ ...p, current: p.current + 1 }));
      }

      // 3. Update từng câu hỏi theo ID, tạo mới câu chưa có ID
      const questionErrors = [];
      for (const q of questions) {
        const payload = {
          question_text: q.content,
          option_a: q.options[0] || "",
          option_b: q.options[1] || "",
          option_c: q.options[2] || "",
          option_d: q.options[3] || "",
          correct_answer: OPTION_LETTERS[q.correctIndex] || "A",
          exam: Number(examId),
        };

        try {
          if (q.id) {
            await updateQuestion(examId, q.id, payload);
          } else {
            await createExamQuestion({ examId, question: payload });
          }
        } catch (qErr) {
          questionErrors.push(`Câu "${q.content.slice(0, 20)}...": ${qErr.message}`);
        }
        setSaveProgress(p => ({ ...p, current: p.current + 1 }));
      }

      if (questionErrors.length > 0) {
        setError(`Cập nhật xong metadata nhưng một số câu hỏi gặp lỗi:\n${questionErrors.join("\n")}`);
      } else {
        setDeletedQuestionIds([]); // Reset sau khi đã xóa thành công
        setSuccess("Cập nhật bài thi thành công!");
        setTimeout(() => {
          navigate(`/exam/${examId}`);
        }, 1500);
      }
      
    } catch (err) {
      setError("Không cập nhật được bài thi");
    } finally {
      setSaving(false);
      setSaveProgress({ current: 0, total: 0 });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportExamResults(examId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `KetQua_${examTitle.replace(/\s+/g, '_').slice(0, 40)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Xuất kết quả thất bại.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const result = await importQuestions(examId, importFile);
      setImportResult({ success: true, ...result });
      // Reload câu hỏi sau khi import
      const { getExamQuestions } = await import('../../api/exams');
      const newQs = await getExamQuestions({ examId });
      const mapped = newQs.map(q => ({
        id: q.id,
        content: q.question_text,
        options: [q.option_a, q.option_b, q.option_c, q.option_d],
        correctIndex: ['A','B','C','D'].indexOf(q.correct_answer),
      }));
      setQuestions(mapped);
      setActiveIndex(0);
    } catch (e) {
      setImportResult({ success: false, message: e?.response?.data?.detail || 'Import thất bại.' });
    } finally {
      setImporting(false);
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
      {/* ── Import Modal ── */}
      {showImport && (
        <div className="import-overlay" onClick={() => setShowImport(false)}>
          <div className="import-modal" onClick={e => e.stopPropagation()}>
            <h3><FaPlus /> Import câu hỏi từ CSV</h3>
            <div className="import-hint">
              <strong>Format CSV:</strong><br />
              <code>Câu hỏi,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng</code><br />
              <small>Cột "Đáp án đúng" nhận giá trị: A / B / C / D</small><br />
              <a href="/mau_import_cau_hoi.csv" download className="sample-csv-link">
                📥 Tải file mẫu CSV
              </a>
            </div>

            <label className="import-file-label">
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => { setImportFile(e.target.files[0]); setImportResult(null); }}
              />
              {importFile ? `📄 ${importFile.name}` : '📂 Chọn file CSV...'}
            </label>

            {importResult && (
              <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
                {importResult.success
                  ? `✅ ${importResult.message} (${importResult.created} câu)`
                  : `❌ ${importResult.message}`}
                {importResult.errors?.length > 0 && (
                  <ul>{importResult.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                )}
              </div>
            )}

            <div className="import-actions">
              <button
                className="import-confirm-btn"
                onClick={handleImport}
                disabled={!importFile || importing}
              >
                {importing ? <><FaSpinner className="spin-icon" /> Đang import...</> : 'Import'}
              </button>
              <button className="import-cancel-btn" onClick={() => setShowImport(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="exam-header">
        <h2><FaEdit /> Chỉnh sửa bài thi</h2>
        <div className="header-actions">
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={exporting}
            title="Xuất kết quả thi ra CSV"
          >
            {exporting ? <FaSpinner className="spin-icon" /> : <FaList />}
            {exporting ? 'Xuất...' : 'Xuất CSV'}
          </button>
          <button
            className="import-btn"
            onClick={() => { setShowImport(true); setImportResult(null); setImportFile(null); }}
            title="Import câu hỏi từ file CSV"
          >
            <FaPlus /> Import CSV
          </button>
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>
      </div>

      {success && (
        <div className="success-message">
          <FaCheck /> {success}
        </div>
      )}

      {/* Progress bar khi đang lưu nhiều câu hỏi */}
      {saving && saveProgress.total > 0 && (
        <div className="save-progress-wrap">
          <div className="save-progress-bar">
            <div
              className="save-progress-fill"
              style={{ width: `${Math.round((saveProgress.current / saveProgress.total) * 100)}%` }}
            />
          </div>
          <span className="save-progress-text">
            Đang lưu... {saveProgress.current}/{saveProgress.total}
          </span>
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

            <div className="form-group">
              <label>📅 Hạn nộp bài</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                title="Sau thời gian này học sinh không thể nộp bài"
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
