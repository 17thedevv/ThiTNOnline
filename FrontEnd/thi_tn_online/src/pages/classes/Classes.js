import { useNavigate } from "react-router-dom";
import "./Classes.css";

const mockClasses = [
  { id: 1, name: "CNTT K22D" },
  { id: 2, name: "CNTT K36D" },
];

const Classes = () => {
  const navigate = useNavigate();

  return (
    <div className="classes-container">
      <h2>Lớp học của tôi</h2>

      <div className="class-grid">
        {mockClasses.map((cls) => (
          <div
            key={cls.id}
            className="class-card"
            onClick={() => navigate(`/classes/${cls.id}`)}
          >
            {cls.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classes;