import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExam, getExamQuestions } from "../../api/exams";
import { submitExam } from "../../api/submissions";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaClock,
  FaFlag,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaPaperPlane,
  FaQuestionCircle,
  FaList,
  FaLightbulb,
  FaExclamationTriangle,
  FaStar,
  FaTrophy,
  FaRedo,
  FaBook,
  FaUserGraduate,
  FaPercent
} from "react-icons/fa";

const ExamDetail = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  const isTeacherLike = role === "teacher" || role === "admin";

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [deadlineFormatted, setDeadlineFormatted] = useState("");

  // UI states
  const [showQuestionPanel, setShowQuestionPanel] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Data loading effect
  useEffect(() => {
    const load = async () => {
      if (!examId) return;
      setLoading(true);
      setError("");
      try {
        const [examData, questionData] = await Promise.all([
          getExam({ examId }),
          getExamQuestions({ examId }),
        ]);
        setExam(examData);
        const normalized = (questionData || []).map((q) => ({
          id: q.id,
          text: q.question_text,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: q.correct_answer,
          image: q.image ? `http://localhost:8000${q.image}` : null,
        }));
        setQuestions(normalized);
        setCurrent(0);
        if (!isTeacherLike) {
          const secs = (examData.duration || 0) * 60;
          setTimeLeft(secs > 0 ? secs : null);

          // Check deadline
          if (examData.due_date) {
            const deadline = new Date(examData.due_date);
            const now = new Date();
            if (now > deadline) {
              setIsExpired(true);
            }
          }
        }
        
        if (examData.due_date) {
          const deadline = new Date(examData.due_date);
          setDeadlineFormatted(deadline.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }));
        }
      } catch (e) {
        setError("Không tải được đề thi. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [examId, isTeacherLike]);

  // Helper functions
  const getUserFullName = () => {
    if (!user) return 'Không xác định';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.username;
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (!timeLeft) return "#6b7280";
    const minutes = Math.floor(timeLeft / 60);
    if (minutes <= 5) return "#dc2626";
    if (minutes <= 10) return "#f59e0b";
    return "#10b981";
  };

  const getProgress = () => {
    const answered = Object.keys(answers).length;
    return Math.round((answered / questions.length) * 100);
  };

  const getStats = () => {
    const answered = Object.keys(answers).length;
    const flaggedCount = Object.values(flagged).filter(Boolean).length;
    const remaining = questions.length - answered;
    return { answered, flaggedCount, remaining };
  };

  // Event handlers
  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleFlag = (questionId) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    // Debug: Log what we're sending
    console.log('DEBUG: Submitting answers:', answers);
    console.log('DEBUG: Answers type:', typeof answers);
    console.log('DEBUG: Answers keys:', Object.keys(answers));
    console.log('DEBUG: Answers values:', Object.values(answers));
    
    console.log('Submitting exam:', {
      examId: parseInt(examId),
      answers: answers,
      totalQuestions: questions.length,
      answeredCount: Object.keys(answers).length
    });
    
    setSubmitting(true);
    try {
      const result = await submitExam({
        examId: parseInt(examId),
        answers: answers,
      });
      console.log('Submit result:', result);
      
      // Calculate correct answers from result
      const correctCount = result.correct_count || 0;
      const totalQuestions = result.total_questions || questions.length;
      const percentage = result.percentage || 0;
      
      setSubmitResult({
        ...result,
        correctCount,
        totalQuestions,
        percentage
      });
    } catch (e) {
      console.error('Submit error:', e);
      setError("Nộp bài thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isTeacherLike) return;
      
      switch (e.key) {
        case "ArrowLeft":
          if (current > 0) setCurrent(current - 1);
          break;
        case "ArrowRight":
          if (current < questions.length - 1) setCurrent(current + 1);
          break;
        case " ":
          e.preventDefault();
          handleFlag(questions[current].id);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, questions, isTeacherLike]);

  // Timer effects (after function definitions)
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0 || isTeacherLike) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTeacherLike]);

  // Auto submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !submitting && !isTeacherLike) {
      handleSubmit();
    }
  }, [timeLeft, submitting, isTeacherLike, handleSubmit]);

  // If teacher, show exam preview instead of taking interface
  if (isTeacherLike) {
    const tCurrent = current;
    const tQuestion = questions[tCurrent];
    return (
      <div style={{ padding: '32px 40px', maxWidth: '1540px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280' }}>Đang tải...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#dc2626' }}>{error}</div>
        ) : exam && questions.length > 0 ? (
          <div>
            {/* Info header */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px 30px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '28px', borderLeft: '5px solid #667eea' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '9px', border: 'none', background: '#f3f4f6', color: '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  <FaArrowLeft /> Quay lại
                </button>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1f2937', flex: 1, textAlign: 'center' }}>{exam.title}</h1>
                <div style={{ fontSize: '13px', color: '#6b7280', background: '#f9fafb', borderRadius: '8px', padding: '6px 14px' }}>
                  Câu {tCurrent + 1} / {questions.length}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '13px', color: '#6b7280', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                <span>⏱ Thời gian: <strong style={{ color: '#1f2937' }}>{exam.duration} phút</strong></span>
                <span>📝 Số câu: <strong style={{ color: '#1f2937' }}>{questions.length}</strong></span>
                <span>🔁 Số lần: <strong style={{ color: exam.max_attempts ? '#f59e0b' : '#16a34a' }}>{exam.max_attempts ?? 'Không giới hạn'}</strong></span>
                <span>📅 Hạn nộp: {exam.due_date
                  ? <strong style={{ color: '#dc2626' }}>{new Date(exam.due_date).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</strong>
                  : <strong style={{ color: '#16a34a' }}>Không giới hạn</strong>}
                </span>
                {exam.created_by_name && <span>👤 Người tạo: <strong style={{ color: '#1f2937' }}>{exam.created_by_name}</strong></span>}
              </div>
            </div>

            {/* Slide layout */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              {/* Main slide */}
              <div style={{ flex: 1 }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '18px', padding: '3px', boxShadow: '0 10px 40px rgba(102,126,234,0.25)' }}>
                  <div style={{ background: 'white', borderRadius: '16px', padding: '36px', minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
                    {/* Badge row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', padding: '7px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' }}>
                        Câu {tCurrent + 1} / {questions.length}
                      </span>
                      <span style={{ background: '#dcfce7', color: '#16a34a', padding: '7px 18px', borderRadius: '20px', fontSize: '14px', fontWeight: '700' }}>
                        ✔ Đáp án: {tQuestion?.correctAnswer}
                      </span>
                    </div>

                    {/* Question text */}
                    <p style={{ fontSize: '19px', lineHeight: '1.8', color: '#1e293b', fontWeight: '500', marginBottom: '26px', flex: 1 }}>
                      {tQuestion?.text}
                    </p>

                    {/* Image */}
                    {tQuestion?.image && (
                      <img src={tQuestion.image} alt="Ảnh câu hỏi" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e5e7eb' }} />
                    )}

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {tQuestion?.options?.map((option, optIndex) => {
                        if (!option) return null;
                        const letter = ['A', 'B', 'C', 'D'][optIndex];
                        const isCorrect = letter === tQuestion?.correctAnswer;
                        return (
                          <div key={optIndex} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '12px', background: isCorrect ? '#f0fdf4' : '#f9fafb', border: `2px solid ${isCorrect ? '#16a34a' : '#e5e7eb'}` }}>
                            <div style={{ width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: isCorrect ? '#16a34a' : '#e5e7eb', color: isCorrect ? 'white' : '#6b7280', fontWeight: 'bold', fontSize: '15px' }}>{letter}</div>
                            <span style={{ flex: 1, fontSize: '16px', color: isCorrect ? '#15803d' : '#374151', fontWeight: isCorrect ? '600' : '400' }}>{option}</span>
                            {isCorrect && <FaCheckCircle style={{ color: '#16a34a', fontSize: '18px', flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', gap: '12px' }}>
                  <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={tCurrent === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 26px', borderRadius: '10px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: tCurrent === 0 ? 'not-allowed' : 'pointer', background: tCurrent === 0 ? '#e5e7eb' : 'linear-gradient(135deg,#667eea,#764ba2)', color: tCurrent === 0 ? '#9ca3af' : 'white', transition: 'all 0.2s' }}>
                    <FaArrowLeft /> Câu trước
                  </button>

                  {/* Dot indicators */}
                  <div style={{ display: 'flex', gap: '7px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
                    {questions.map((_, i) => (
                      <button key={i} onClick={() => setCurrent(i)} title={`Câu ${i + 1}`}
                        style={{ width: i === tCurrent ? '28px' : '10px', height: '10px', borderRadius: '5px', border: 'none', padding: 0, cursor: 'pointer', background: i === tCurrent ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#d1d5db', transition: 'all 0.3s ease' }} />
                    ))}
                  </div>

                  <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={tCurrent === questions.length - 1}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 26px', borderRadius: '10px', border: 'none', fontWeight: '600', fontSize: '15px', cursor: tCurrent === questions.length - 1 ? 'not-allowed' : 'pointer', background: tCurrent === questions.length - 1 ? '#e5e7eb' : 'linear-gradient(135deg,#667eea,#764ba2)', color: tCurrent === questions.length - 1 ? '#9ca3af' : 'white', transition: 'all 0.2s' }}>
                    Câu tiếp <FaArrowRight />
                  </button>
                </div>
              </div>

              {/* Sidebar answer key */}
              <div style={{ width: '200px', flexShrink: 0, position: 'sticky', top: '20px' }}>
                <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: '14px 18px' }}>
                    <h4 style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: '700' }}>🗂 Bảng đáp án</h4>
                  </div>
                  <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '500px', overflowY: 'auto' }}>
                    {questions.map((q, index) => (
                      <button key={q.id} onClick={() => setCurrent(index)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', border: 'none', background: index === tCurrent ? '#ede9fe' : 'transparent', outline: index === tCurrent ? '2px solid #667eea' : '1px solid #f3f4f6', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: '13px', color: index === tCurrent ? '#5b21b6' : '#6b7280', fontWeight: index === tCurrent ? '700' : '400' }}>Câu {index + 1}</span>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#16a34a', background: '#dcfce7', padding: '2px 10px', borderRadius: '12px' }}>{q.correctAnswer}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280' }}>Không tìm thấy đề thi hoặc chưa có câu hỏi.</div>
        )}
      </div>
    );
  }

  const handleNext = () => {
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleJump = (index) => {
    setCurrent(index);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h2>Đang tải đề thi...</h2>
        <p>Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <FaExclamationTriangle style={{ fontSize: '64px', marginBottom: '20px' }} />
          <h2>Đã có lỗi xảy ra</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'white',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '20px'
            }}
          >
            <FaRedo /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (submitResult) {
    // REVIEW ANSWERS MODE
    if (showReview) {
      return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '30px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#1f2937' }}>Xem lại đáp án</h2>
                <p style={{ margin: '4px 0 0', color: '#6b7280' }}>{exam?.title}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '14px', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>✅ Đúng: {submitResult.correctCount || 0}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>❌ Sai: {(submitResult.totalQuestions || 0) - (submitResult.correctCount || 0)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6' }}>⭐ Điểm: {submitResult.score || 0}/10</span>
                </div>
                <button
                  onClick={() => setShowReview(false)}
                  style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  &larr; Quay lại kết quả
                </button>
              </div>
            </div>

            {questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              const didAnswer = !!userAnswer;
              return (
                <div key={q.id} style={{
                  background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px',
                  border: `2px solid ${!didAnswer ? '#e5e7eb' : isCorrect ? '#16a34a' : '#dc2626'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>Câu {index + 1}</span>
                    {!didAnswer ? (
                      <span style={{ color: '#d97706', fontWeight: '600', fontSize: '14px' }}>⚠️ Chưa trả lời</span>
                    ) : isCorrect ? (
                      <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>✅ Đúng</span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '14px' }}>❌ Sai</span>
                    )}
                  </div>
                  <p style={{ fontSize: '17px', lineHeight: '1.6', margin: '0 0 16px', color: '#1f2937' }}>{q.text}</p>
                  {q.image && (
                    <img src={q.image} alt="Ảnh minh họa" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', border: '1px solid #e5e7eb', objectFit: 'contain', marginBottom: '12px' }} />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {q.options.map((opt, i) => {
                      if (!opt) return null;
                      const letter = ['A', 'B', 'C', 'D'][i];
                      const isCorrectOpt = letter === q.correctAnswer;
                      const isUserOpt = letter === userAnswer;
                      let bg = '#f9fafb', border = '#e5e7eb', textColor = '#374151';
                      if (isCorrectOpt) { bg = '#dcfce7'; border = '#16a34a'; textColor = '#15803d'; }
                      else if (isUserOpt && !isCorrect) { bg = '#fee2e2'; border = '#dc2626'; textColor = '#b91c1c'; }
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: bg, border: `2px solid ${border}`, borderRadius: '8px' }}>
                          <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCorrectOpt ? '#16a34a' : isUserOpt ? '#dc2626' : '#9ca3af', color: 'white', borderRadius: '50%', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}>{letter}</div>
                          <span style={{ flex: 1, color: textColor, fontWeight: isCorrectOpt ? '600' : '400' }}>{opt}</span>
                          {isCorrectOpt && <span style={{ color: '#16a34a', fontWeight: '700' }}>✔ Đúng</span>}
                          {isUserOpt && !isCorrect && <span style={{ color: '#dc2626', fontWeight: '700' }}>Bạn chọn</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // NORMAL RESULT SCREEN
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <FaTrophy style={{ fontSize: '64px', color: '#fbbf24', marginBottom: '16px' }} />
            <h2>Nộp bài thành công!</h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: '#eff6ff',
              color: '#3b82f6',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <FaStar style={{ fontSize: '24px', marginBottom: '8px' }} />
              <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '700' }}>{submitResult.score || 0}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>Điểm số</p>
            </div>
            
            <div style={{
              background: '#d1fae5',
              color: '#10b981',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <FaCheckCircle style={{ fontSize: '24px', marginBottom: '8px' }} />
              <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '700' }}>{submitResult.correctCount || 0}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>Câu đúng</p>
            </div>
            
            <div style={{
              background: '#fef3c7',
              color: '#d97706',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <FaPercent style={{ fontSize: '24px', marginBottom: '8px' }} />
              <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '700' }}>{submitResult.percentage || 0}%</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>Tỷ lệ đúng</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                if (exam?.exam_class) {
                  window.location.href = `/classes/${exam.exam_class}`;
                } else {
                  window.history.back();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <FaArrowLeft /> Quay lại lớp học
            </button>
            <button
              onClick={() => setShowReview(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <FaBook /> Xem lại đáp án
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired && !isTeacherLike && !submitResult) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', background: 'white', padding: '40px', borderRadius: '16px', color: '#1f2937' }}>
          <FaExclamationTriangle style={{ fontSize: '64px', color: '#ef4444', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Đã hết hạn làm bài</h2>
          <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.6' }}>
            Rất tiếc, bài thi này đã hết hạn nộp vào lúc:<br/>
            <strong style={{ color: '#ef4444', fontSize: '18px' }}>{deadlineFormatted}</strong>
          </p>
          <button 
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const question = questions[current];

  if (!question || questions.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <FaExclamationTriangle style={{ fontSize: '64px', marginBottom: '20px' }} />
          <h2>Không có câu hỏi</h2>
          <p>Đề thi này chưa có câu hỏi nào.</p>
          <button 
            onClick={() => window.history.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'white',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '20px'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#1a1a2e' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 30px',
        background: darkMode ? '#2d3748' : 'white',
        borderBottom: '1px solid #e2e8f0',
        color: darkMode ? 'white' : '#1a202c'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <FaArrowLeft /> Thoát
          </button>
          <div>
            <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>{exam?.title}</h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '4px', fontSize: '14px', color: '#718096' }}>
              <span><FaUserGraduate /> {getUserFullName()}</span>
              {deadlineFormatted ? (
                <span style={{ color: isExpired ? '#ef4444' : '#059669', fontWeight: 'bold' }}>
                  <FaClock /> Hạn nộp: {deadlineFormatted}
                </span>
              ) : (
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                  <FaClock /> Hạn nộp: Không giới hạn
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setShowTimer(!showTimer)}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: showTimer ? '#3b82f6' : '#e2e8f0',
                color: showTimer ? 'white' : '#4a5568',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <FaClock />
            </button>
            <button 
              onClick={() => setShowQuestionPanel(!showQuestionPanel)}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: showQuestionPanel ? '#3b82f6' : '#e2e8f0',
                color: showQuestionPanel ? 'white' : '#4a5568',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <FaList />
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: darkMode ? '#3b82f6' : '#e2e8f0',
                color: darkMode ? 'white' : '#4a5568',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <FaLightbulb />
            </button>
          </div>
          
          {showTimer && !isTeacherLike && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'white',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '18px',
              color: getTimeColor()
            }}>
              <FaClock />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
        {/* Question Panel */}
        {showQuestionPanel && (
          <aside style={{
            width: '300px',
            background: darkMode ? '#2d3748' : 'white',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            padding: '20px',
            color: darkMode ? 'white' : '#1a202c'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
              <FaList /> Danh sách câu hỏi
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                height: '8px',
                background: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  height: '100%',
                  background: '#3b82f6',
                  width: `${getProgress()}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6' }}>{getProgress()}%</span>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
              padding: '16px',
              background: darkMode ? '#4a5568' : '#f7fafc',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <FaCheckCircle style={{ color: '#48bb78' }} />
                <span>Đã trả lời: {stats.answered}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <FaFlag style={{ color: '#ed8936' }} />
                <span>Đã đánh dấu: {stats.flaggedCount}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <FaQuestionCircle style={{ color: '#718096' }} />
                <span>Còn lại: {stats.remaining}</span>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '24px'
            }}>
              {questions.map((q, index) => {
                const isAnswered = answers[q.id];
                const isFlagged = flagged[q.id];
                const isCurrent = index === current;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => handleJump(index)}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isCurrent ? '#bee3f8' : isAnswered ? '#c6f6d5' : isFlagged ? '#feebc8' : '#e2e8f0',
                      border: isCurrent ? '2px solid #3182ce' : isAnswered ? '2px solid #48bb78' : isFlagged ? '2px solid #ed8936' : '2px solid transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => setShowConfirmSubmit(true)}
              disabled={stats.answered === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: stats.answered === 0 ? '#e2e8f0' : '#3b82f6',
                color: stats.answered === 0 ? '#a0aec0' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: stats.answered === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              <FaPaperPlane /> Nộp bài
            </button>
          </aside>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px', overflowY: 'auto' }}>
          <div style={{
            background: darkMode ? '#2d3748' : 'white',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '20px',
            flex: 1,
            color: darkMode ? 'white' : '#1a202c'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                  Câu {current + 1}/{questions.length}
                </span>
                <button 
                  onClick={() => handleFlag(question.id)}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: flagged[question.id] ? '#feebc8' : '#e2e8f0',
                    color: flagged[question.id] ? '#d69e2e' : '#4a5568',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {flagged[question.id] ? <FaFlag /> : <FaFlag />}
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <div style={{ lineHeight: '1.6', marginBottom: '16px', fontSize: '18px' }}>
                {question.text}
              </div>
              {question.image && (
                <img
                  src={question.image}
                  alt="Ảnh minh họa"
                  style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '10px', border: '1px solid #e2e8f0', objectFit: 'contain', marginTop: '8px' }}
                />
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {question.options && question.options.map((option, index) => {
                if (!option) return null;
                const letter = ['A', 'B', 'C', 'D'][index];
                const isSelected = answers[question.id] === letter;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(question.id, letter)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      background: isSelected ? '#bee3f8' : '#f7fafc',
                      border: isSelected ? '2px solid #3182ce' : '2px solid #e2e8f0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      fontWeight: 'bold'
                    }}>
                      {letter}
                    </div>
                    <div style={{ flex: 1, lineHeight: '1.5' }}>{option}</div>
                    {isSelected && <FaCheckCircle style={{ color: '#48bb78', fontSize: '20px' }} />}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px'
          }}>
            <button 
              onClick={handlePrev}
              disabled={current === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '8px',
                cursor: current === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              <FaArrowLeft /> Câu trước
            </button>
            
            <div style={{ fontWeight: 'bold', color: '#718096' }}>
              {current + 1} / {questions.length}
            </div>
            
            <button 
              onClick={handleNext}
              disabled={current === questions.length - 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: current === questions.length - 1 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              Câu tiếp <FaArrowRight />
            </button>
          </div>
        </main>
      </div>
      
      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <FaExclamationTriangle style={{ fontSize: '24px', color: '#d69e2e' }} />
              <h3 style={{ margin: 0, fontSize: '20px' }}>Xác nhận nộp bài</h3>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '16px',
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tổng số câu:</span>
                  <strong>{questions.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Đã trả lời:</span>
                  <strong style={{ color: '#48bb78' }}>{stats.answered}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Chưa trả lời:</span>
                  <strong style={{ color: '#d69e2e' }}>{stats.remaining}</strong>
                </div>
              </div>
              
              {stats.remaining > 0 && (
                <div style={{
                  padding: '12px',
                  background: '#feebc8',
                  borderRadius: '8px',
                  borderLeft: '4px solid #d69e2e'
                }}>
                  <p style={{ margin: 0, color: '#975a16' }}>
                    Bạn còn {stats.remaining} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowConfirmSubmit(false)}
                style={{
                  padding: '12px 20px',
                  background: '#e2e8f0',
                  color: '#4a5568',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Tiếp tục làm bài
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '12px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {submitting ? 'Đang nộp...' : 'Xác nhận nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;
