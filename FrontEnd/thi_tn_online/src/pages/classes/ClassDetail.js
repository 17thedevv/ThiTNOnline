import { useParams, Link } from "react-router-dom";

const ClassDetail = () => {
  const { id } = useParams();

  const classData = {
    1: {
      name: "Lập trình Web",
      teacher: "Thầy A",
      description: "ReactJS + NodeJS",
    },
    2: {
      name: "Cơ sở dữ liệu",
      teacher: "Cô B",
      description: "MySQL, MongoDB",
    },
    3: {
      name: "Mạng máy tính",
      teacher: "Thầy C",
      description: "TCP/IP, Routing",
    },
  };

  const classInfo = classData[id];

  if (!classInfo) {
    return <p>Không tìm thấy lớp học</p>;
  }

  return (
    <div>
      <h2>Chi tiết lớp học</h2>

      <p><strong>Tên lớp:</strong> {classInfo.name}</p>
      <p><strong>Giảng viên:</strong> {classInfo.teacher}</p>
      <p><strong>Mô tả:</strong> {classInfo.description}</p>

      <br />
      <Link to="/classes">⬅ Quay lại danh sách lớp</Link>
    </div>
  );
};

export default ClassDetail;
