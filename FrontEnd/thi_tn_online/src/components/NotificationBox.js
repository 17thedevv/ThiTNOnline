import "./NotificationBox.css";

const notifications = [
  {
    id: 1,
    title: "Bạn có bài kiểm tra mới",
    desc: "Lớp Lập trình Web vừa đăng bài kiểm tra mới",
    time: "2 phút trước",
    isNew: true,
  },
  {
    id: 2,
    title: "Bạn đã được thêm vào lớp mới",
    desc: "Bạn vừa tham gia lớp Cơ sở dữ liệu",
    time: "1 giờ trước",
  },
  {
    id: 3,
    title: "Kết quả đã có",
    desc: "Điểm bài Toán chương 1 đã được công bố",
    time: "Hôm qua",
  },
];

const NotificationBox = () => {
  return (
    <div className="notify-box">
      <h3 className="notify-title">🔔 Thông báo</h3>

      <div className="notify-list">
        {notifications.map((n) => (
          <div key={n.id} className="notify-item">
            <div className="notify-content">
              <div className="notify-head">
                <span className="notify-text">{n.title}</span>
                {n.isNew && <span className="notify-badge">Mới</span>}
              </div>
              <p className="notify-desc">{n.desc}</p>
              <span className="notify-time">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationBox;