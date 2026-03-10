import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./ExamDetail.css";
import { getExam, getExamQuestions } from "../../api/exams";
import { submitExam, listSubmissions } from "../../api/submissions";
import { useAuth } from "../../contexts/AuthContext";

const ExamDetail = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const role = user?.role;
  const isTeacherLike = role === "teacher" || role === "admin";

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> letter
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [attemptInfo, setAttemptInfo] = useState({ max: null, used: 0 });

  useEffect(() => {
    const load = async () => {
      if (!examId) return;
      setLoading(true);
      setError("");
      try {
        const [examData, questionData, allSubs] = await Promise.all([
          getExam({ examId }),
          getExamQuestions({ examId }),
          listSubmissions(),
        ]);
        setExam(examData);
        const normalized = (questionData || []).map((q) => ({
          id: q.id,
          text: q.question_text,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: q.correct_answer,
        }));
        setQuestions(normalized);
        setCurrent(0);
        if (!isTeacherLike) {
          const secs = (examData.duration || 0) * 60;
          setTimeLeft(secs > 0 ? secs : null);
        }

        const examIdNum = Number(examId);
        const mySubs = (allSubs || [])
          .filter((s) => s.exam === examIdNum)
          .sort(
            (a, b) =>
              new Date(b.submitted_at || 0).getTime() -
              new Date(a.submitted_at || 0).getTime()
          );
        setHistory(mySubs);
        setLoadingHistory(false);

        const maxAttempts =
          typeof examData.max_attempts === "number"
            ? examData.max_attempts
            : null;
        const used = mySubs.length;
        setAttemptInfo({ max: maxAttempts, used });
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          "Không tải được đề thi. Vui lòng thử lại.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId, isTeacherLike]);

  useEffect(() => {
    if (isTeacherLike || timeLeft == null || submitResult) return;

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev != null ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTeacherLike, submitResult]);

  const currentQuestion = useMemo(
    () => (questions.length > 0 ? questions[current] : null),
    [questions, current]
  );

  const handleSelect = (optIndex) => {
    if (!currentQuestion || isTeacherLike) return;
    const letter = String.fromCharCode(65 + optIndex);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: letter,
    }));
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const formatTime = () => {
    if (timeLeft == null) return "Không giới hạn";
    const safe = Math.max(0, timeLeft);
    const min = Math.floor(safe / 60);
    const sec = safe % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((idx) => idx + 1);
    }
  };

  const prevQuestion = () => {
    if (current > 0) {
      setCurrent((idx) => idx - 1);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (isTeacherLike) return;
    if (!examId || questions.length === 0) return;

    const answeredCount = Object.keys(answers).length;
    const unanswered = questions.length - answeredCount;

    if (!auto && unanswered > 0) {
      const confirmSubmit = window.confirm(
        `Bạn còn ${unanswered} câu chưa làm. Vẫn nộp bài?`
      );
      if (!confirmSubmit) return;
    }

    if (attemptInfo.max != null && attemptInfo.used >= attemptInfo.max) {
      setError("Bạn đã hết số lần làm bài cho đề thi này.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const result = await submitExam({
        examId: Number(examId),
        answers,
      });
      setSubmitResult(result);
      setHistory((prev) => [result, ...(prev || [])]);
      setAttemptInfo((prev) => ({
        max: prev.max,
        used: prev.used + 1,
      }));
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        "Nộp bài thất bại. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="exam-container">
      <div className="exam-header">
        <div>
          <h2>{exam ? exam.title : "Đang tải đề thi..."}</h2>
          <div style={{ fontSize: 14, color: "#6b7280" }}>
            {isTeacherLike
              ? "Chế độ xem đề (giáo viên)"
              : "Chế độ làm bài (học sinh)"}
          </div>
          {!isTeacherLike && !loadingHistory && (
            <div style={{ fontSize: 13, color: "#4b5563", marginTop: 4 }}>
              {history.length === 0 ? (
                <span>Bạn chưa làm đề này lần nào.</span>
              ) : (
                <span>
                  Lần gần nhất: điểm{" "}
                  <strong>{history[0].score}</strong> ·{" "}
                  {history[0].submitted_at
                    ? new Date(
                        history[0].submitted_at
                      ).toLocaleString()
                    : "chưa rõ thời gian"}
                  {history.length > 1
                    ? ` · Tổng số lần làm: ${history.length}`
                    : ""}
                  {attemptInfo.max != null && (
                    <>
                      {" "}
                      · Giới hạn: {attemptInfo.max} lần, đã dùng{" "}
                      {Math.min(attemptInfo.used, attemptInfo.max)} lần
                    </>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="exam-timer">⏳ {formatTime()}</div>
          {!isTeacherLike && (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={
                submitting ||
                !!submitResult ||
                (attemptInfo.max != null &&
                  attemptInfo.used >= attemptInfo.max)
              }
            >
              {attemptInfo.max != null &&
              attemptInfo.used >= attemptInfo.max &&
              !submitResult
                ? "Đã hết lượt làm"
                : submitResult
                ? `Đã nộp (Điểm: ${submitResult.score})`
                : submitting
                ? "Đang nộp..."
                : "Nộp bài"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p style={{ color: "#dc2626", marginTop: 8 }}>{error}</p>
      )}

      {loading ? (
        <p>Đang tải đề thi...</p>
      ) : !currentQuestion ? (
        <p>Đề thi chưa có câu hỏi.</p>
      ) : (
        <div className="exam-body">
          <div className="question-panel">
            <h3>
              Câu {current + 1}: {currentQuestion.text}
            </h3>

            <div className="options">
              {currentQuestion.options.map((opt, index) => {
                const letter = String.fromCharCode(65 + index);
                const selected =
                  answers[currentQuestion.id] === letter;
                const isCorrect =
                  currentQuestion.correctAnswer &&
                  currentQuestion.correctAnswer.toUpperCase() ===
                    letter.toUpperCase();
                const showResult = submitResult || isTeacherLike;

                let extraClass = "";
                if (showResult) {
                  if (isCorrect) {
                    extraClass = "correct";
                  } else if (selected && !isCorrect) {
                    extraClass = "incorrect";
                  }
                }

                return (
                  <div
                    key={index}
                    className={`option ${
                      selected ? "selected" : ""
                    } ${extraClass} ${isTeacherLike ? "readonly" : ""}`}
                    onClick={() => handleSelect(index)}
                  >
                    <strong style={{ marginRight: 8 }}>{letter}.</strong>
                    {opt}
                  </div>
                );
              })}
            </div>

            {!isTeacherLike && (
              <div className="question-buttons">
                <button
                  className="prev-btn"
                  onClick={prevQuestion}
                  disabled={current === 0}
                >
                  ← Câu trước
                </button>

                <button className="flag-btn" onClick={toggleFlag}>
                  {flagged[currentQuestion.id]
                    ? "Bỏ phân vân"
                    : "Phân vân"}
                </button>

                <button
                  className="next-btn"
                  onClick={nextQuestion}
                  disabled={current === questions.length - 1}
                >
                  Câu tiếp →
                </button>
              </div>
            )}
          </div>

          <div className="navigator">
            {questions.map((q, index) => {
              const hasAnswer = !!answers[q.id];
              const isCurrent = current === index;
              const isFlagged = flagged[q.id];

              return (
                <div
                  key={q.id}
                  className={`nav-item
                  ${isCurrent ? "active" : ""}
                  ${hasAnswer ? "answered" : "unanswered"}
                  ${isFlagged ? "flagged" : ""}
                `}
                  onClick={() => setCurrent(index)}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetail;