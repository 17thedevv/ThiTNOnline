import { useParams } from "react-router-dom";
import "./ClassDetail.css";

const ClassDetail = () => {
  const { id } = useParams();

  // Fake data (sau này thay bằng API)
  const classInfo = {
    id,
    name: "Lập trình Web",
    teacher: "Thầy A",
    cover:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  };

  const exams = [
    { id: 1, title: "HTML & CSS cơ bản", questions: 20 },
    { id: 2, title: "JavaScript căn bản", questions: 25 },
    { id: 3, title: "React JS", questions: 30 },
  ];

  return (
    <div className="class-detail">
      {/* Banner */}
      <div
        className="class-banner"
        style={{ backgroundImage: `url(${classInfo.cover})` }}
      >
        <div className="class-banner-overlay">
          <h1>{classInfo.name}</h1>
          <p>Giáo viên: {classInfo.teacher}</p>
        </div>
      </div>

      {/* Nội dung */}
      <div className="class-content">
        <h2>Bài trắc nghiệm</h2>

        <div className="exam-list">
          {exams.map((exam) => (
            <div className="exam-card" key={exam.id}>
              <div className="exam-icon">📝</div>
              <div className="exam-info">
                <h3>{exam.title}</h3>
                <p>{exam.questions} câu hỏi</p>
              </div>
              <button className="exam-btn">Vào làm</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
