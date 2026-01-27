import { useParams } from "react-router-dom";
import "./ExamDetail.css";

const ExamDetail = () => {
  const { id } = useParams();

  // mock dữ liệu bài thi
  const exam = {
    title: "Kiểm tra Toán chương 1",
    duration: 45,
    questions: [
      {
        id: 1,
        content: "1 + 1 = ?",
        options: ["1", "2", "3", "4"],
      },
      {
        id: 2,
        content: "2 × 3 = ?",
        options: ["4", "5", "6", "7"],
      },
    ],
  };

  return (
    <div className="exam-detail">
      <h2>{exam.title}</h2>
      <p>Thời gian làm bài: {exam.duration} phút</p>

      <div className="question-list">
        {exam.questions.map((q, index) => (
          <div key={q.id} className="question-item">
            <h4>
              Câu {index + 1}: {q.content}
            </h4>

            {q.options.map((opt, i) => (
              <label key={i} className="option">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}
      </div>

      <button className="submit-btn">Nộp bài</button>
    </div>
  );
};

export default ExamDetail;
