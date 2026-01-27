import "./PublicDashboard.css";
import { Link } from "react-router-dom";

const PublicDashboard = () => {
  return (
    <div className="home">
      <div className="home-content">
        <h1>Học hành là chuyện cả đời</h1>
        <p>hãy tham gia nền tảng thi trắc nghiệm online, quý khách được chải nghiệm
          hệ thống kiểm tra online miễn phí, vipro trọn đời
        </p>

        <Link to="/login" className="home-btn">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};

export default PublicDashboard;
