import { Link } from "react-router-dom";

const Classes = () => {
  const classes = [
    { id: 1, name: "Lập trình Web", teacher: "Thầy A" },
    { id: 2, name: "Cơ sở dữ liệu", teacher: "Cô B" },
    { id: 3, name: "Mạng máy tính", teacher: "Thầy C" },
  ];

  return (
    <div>
      <h2>Danh sách lớp học</h2>

      <ul>
        {classes.map((item) => (
          <li key={item.id}>
            <Link to={`/classes/${item.id}`}>
              {item.name} – {item.teacher}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Classes;
