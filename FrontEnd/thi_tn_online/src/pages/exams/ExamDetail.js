import { useState, useEffect } from "react";
import "./ExamDetail.css";

const mockQuestions = [
  {
    id: 1,
    question: "React là gì?",
    options: ["Thư viện JS", "Framework PHP", "Database", "Hệ điều hành"],
  },
  {
    id: 2,
    question: "useState dùng để làm gì?",
    options: ["Call API", "Quản lý state", "Routing", "Thiết kế CSS"],
  },
  {
    id: 3,
    question: "JSX là gì?",
    options: ["HTML trong JS", "Database", "API", "Router"],
  },
];

const ExamDetail = () => {

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);

  // TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // SELECT ANSWER
  const handleSelect = (option) => {
    setAnswers({
      ...answers,
      [current]: option,
    });
  };

  // FLAG QUESTION
  const toggleFlag = () => {
    setFlagged({
      ...flagged,
      [current]: !flagged[current],
    });
  };

  // FORMAT TIME
  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // NEXT
  const nextQuestion = () => {
    if (current < mockQuestions.length - 1) {
      setCurrent(current + 1);
    }
  };

  // PREV
  const prevQuestion = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  // SUBMIT
  const handleSubmit = () => {

    const unanswered = mockQuestions.length - Object.keys(answers).length;

    if (unanswered > 0) {
      const confirmSubmit = window.confirm(
        `Bạn còn ${unanswered} câu chưa làm. Vẫn nộp bài?`
      );

      if (!confirmSubmit) return;
    }

    console.log("Answers:", answers);
    console.log("Flagged:", flagged);
  };

  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <h2>Đề thi React cơ bản</h2>
        <div className="exam-timer">⏳ {formatTime()}</div>
        <button className="submit-btn" onClick={handleSubmit}>
          Nộp bài
        </button>
      </div>

      <div className="exam-body">

        {/* QUESTION */}
        <div className="question-panel">

          <h3>
            Câu {current + 1}: {mockQuestions[current].question}
          </h3>

          <div className="options">
            {mockQuestions[current].options.map((opt, index) => (
              <div
                key={index}
                className={`option ${
                  answers[current] === opt ? "selected" : ""
                }`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="question-buttons">

            <button
              className="prev-btn"
              onClick={prevQuestion}
              disabled={current === 0}
            >
              ← Câu trước
            </button>

            <button
              className="flag-btn"
              onClick={toggleFlag}
            >
              {flagged[current] ? "Bỏ phân vân" : "Phân vân"}
            </button>

            <button
              className="next-btn"
              onClick={nextQuestion}
              disabled={current === mockQuestions.length - 1}
            >
              Câu tiếp →
            </button>

          </div>

        </div>

        {/* NAVIGATOR */}
        <div className="navigator">

          {mockQuestions.map((_, index) => {

            const isAnswered = answers[index];
            const isCurrent = current === index;
            const isFlagged = flagged[index];

            return (
              <div
                key={index}
                className={`nav-item
                  ${isCurrent ? "active" : ""}
                  ${isAnswered ? "answered" : "unanswered"}
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

    </div>
  );
};

export default ExamDetail;