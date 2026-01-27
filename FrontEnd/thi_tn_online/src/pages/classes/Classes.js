import { Link } from "react-router-dom";
import "./Classes.css";

const Classes = () => {
  const classes = [
    {
      id: 1,
      name: "Lập trình Web",
      teacher: "Thầy A",
      image: "/images/class1.jpg",
    },
    {
      id: 2,
      name: "Cơ sở dữ liệu",
      teacher: "Cô B",
      image: "/images/class2.jpg",
    },
    {
      id: 3,
      name: "Mạng máy tính",
      teacher: "Thầy C",
      image: "/images/class3.jpg",
    },
  ];

  return (
    <div className="classes-page">
      <h2 className="classes-title">Lớp học của tôi</h2>

      <div className="classes-grid">
        {classes.map((item) => (
          <Link
            to={`/classes/${item.id}`}
            key={item.id}
            className="class-card"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <div className="class-overlay">
              <h3>{item.name}</h3>
              <p>{item.teacher}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Classes;
