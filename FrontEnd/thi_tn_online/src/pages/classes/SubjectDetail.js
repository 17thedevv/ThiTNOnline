import { useParams, useNavigate } from "react-router-dom";

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const exams = [
    { id: 101, name: "Kiểm tra 15 phút" },
    { id: 102, name: "Thi giữa kỳ" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Môn #{subjectId}</h2>

        {/* NÚT TẠO ĐỀ */}
        <button
          style={{
            background: "#ec4899",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/subjects/${subjectId}/create-exam`)}
        >
          + Tạo đề
        </button>
      </div>

      {exams.map((exam) => (
        <div
          key={exam.id}
          style={{
            background: "white",
            padding: "16px",
            marginTop: "10px",
            borderRadius: "8px",
          }}
        >
          {exam.name}
          <button
            style={{ float: "right" }}
            onClick={() => navigate(`/exam/${exam.id}`)}
          >
            Làm bài
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubjectDetail;