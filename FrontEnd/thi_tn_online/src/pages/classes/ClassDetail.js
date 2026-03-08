import { useParams, useNavigate } from "react-router-dom";

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const subjects = [
    { id: 11, name: "Lập trình Web" },
    { id: 12, name: "Cấu trúc dữ liệu" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h2>Lớp #{classId}</h2>

      {subjects.map((subject) => (
        <div
          key={subject.id}
          style={{
            background: "white",
            padding: "16px",
            marginTop: "10px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/subjects/${subject.id}`)}
        >
          {subject.name}
        </div>
      ))}
    </div>
  );
};

export default ClassDetail;