import { useState } from "react";
import "./CreateExam.css";

const CreateExam = () => {
  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(15);
  const [questions, setQuestions] = useState([
    {
      content: "",
      options: ["", "", "", ""],
      correctIndex: null,
    },
  ]);

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
    setQuestions([
      ...questions,
      {
        content: "",
        options: ["", "", "", ""],
        correctIndex: null,
      },
    ]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = () => {
    const examData = {
      title: examTitle,
      duration,
      questions,
    };

    console.log("Exam Created:", examData);
    alert("Đã lưu đề (mock)");
  };

  return (
    <div className="create-exam-container">
      <h2>Tạo đề thi</h2>

      {/* Thông tin đề */}
      <div className="exam-info-card">
        <input
          type="text"
          placeholder="Tên đề thi..."
          value={examTitle}
          onChange={(e) => setExamTitle(e.target.value)}
        />

        <div className="duration-box">
          Thời gian (phút):
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question-card">
          <div className="question-header">
            <h4>Câu {qIndex + 1}</h4>
            {questions.length > 1 && (
              <button
                className="delete-btn"
                onClick={() => removeQuestion(qIndex)}
              >
                Xoá
              </button>
            )}
          </div>

          <textarea
            placeholder="Nhập nội dung câu hỏi..."
            value={q.content}
            onChange={(e) =>
              handleQuestionChange(qIndex, e.target.value)
            }
          />

          <div className="options">
            {q.options.map((opt, optIndex) => (
              <div key={optIndex} className="option-row">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctIndex === optIndex}
                  onChange={() =>
                    handleCorrectChange(qIndex, optIndex)
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
                      qIndex,
                      optIndex,
                      e.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="add-question-btn" onClick={addQuestion}>
        + Thêm câu hỏi
      </button>

      <div className="submit-area">
        <button className="save-btn" onClick={handleSubmit}>
          Lưu đề thi
        </button>
      </div>
    </div>
  );
};

export default CreateExam;