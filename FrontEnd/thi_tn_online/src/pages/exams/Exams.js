import { Link } from "react-router-dom";
import "./Exams.css";

const Exams = () => {
  const exams = [
    {
      id: 1,
      title: "Kiểm tra Toán chương 1",
      subject: "Toán 12",
      duration: 45,
      questions: 30,
      status: "Chưa làm",
    },
    {
      id: 2,
      title: "Ôn tập Vật lý – Dao động",
      subject: "Vật lý 11",
      duration: 30,
      questions: 20,
      status: "Đã làm",
    },
  ];

  return (
    <div className="exams-page">
      <h2>Bài trắc nghiệm</h2>

      <div className="exam-list">
        {exams.map((exam) => (
          <div key={exam.id} className="exam-card">
            <div className="exam-info">
              <h3>{exam.title}</h3>
              <p>Môn: {exam.subject}</p>
              <p>{exam.questions} câu • {exam.duration} phút</p>
            </div>

            <div className="exam-action">
              <span
                className={`status ${
                  exam.status === "Đã làm" ? "done" : "pending"
                }`}
              >
                {exam.status}
              </span>

              <Link to={`/exams/${exam.id}`} className="btn-start">
                Vào làm bài
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exams;
