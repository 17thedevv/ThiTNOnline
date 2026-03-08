import { useNavigate } from "react-router-dom";
import "./Courses.css";

const mockCourses = [
  { id: 1, name: "React Cơ Bản" },
  { id: 2, name: "JavaScript Nâng Cao" },
];

const Courses = () => {
  const navigate = useNavigate();

  return (
    <div className="courses-container">
      <h2>Khóa học của tôi</h2>

      <div className="course-grid">
        {mockCourses.map((course) => (
          <div
            key={course.id}
            className="course-card"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            <h3>{course.name}</h3>
            <p>3 bài kiểm tra</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;