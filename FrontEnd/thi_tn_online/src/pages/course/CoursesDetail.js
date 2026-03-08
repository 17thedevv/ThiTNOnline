import { useParams, useNavigate } from "react-router-dom";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const exams = [
    { id: 101, name: "Kiểm tra 15 phút" },
    { id: 102, name: "Thi giữa kỳ" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h2>Khóa học #{id}</h2>

      {exams.map((exam) => (
        <div
          key={exam.id}
          style={{
            background: "white",
            padding: "16px",
            marginTop: "10px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/exam/${exam.id}`)}
        >
          {exam.name}
          <button style={{ float: "right" }}>Làm bài</button>
        </div>
      ))}
    </div>
  );
};

export default CourseDetail;