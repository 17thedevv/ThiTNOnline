# Hệ Thống Thi Trắc Nghiệm Trực Tuyến (ThiTNOnline)

Một nền tảng thi trắc nghiệm trực tuyến toàn diện, cho phép giáo viên quản lý lớp học, môn học, bộ đề thi và học sinh dễ dàng thực hiện các bài thi với giao diện hiện đại, thân thiện.

## 🚀 Tính Năng Nổi Bật

### 👨‍🏫 Dành cho Giáo viên (Teacher) & Quản trị viên (Admin)
- **Quản lý Lớp học & Môn học**: Phân cấp quản lý rõ ràng từ Lớp học -> Môn học -> Đề thi.
- **Tạo & Quản lý Đề thi**:
  - Soạn câu hỏi trực tiếp trên giao diện web.
  - Hỗ trợ **nhập câu hỏi hàng loạt từ file CSV**.
  - Tùy chỉnh thời gian làm bài, hạn nộp bài, số lần làm bài tối đa.
  - Xáo trộn câu hỏi và xáo trộn vị trí đáp án để chống gian lận.
- **Chấm điểm & Thống kê**:
  - Hệ thống tự động chấm điểm ngay sau khi nộp bài.
  - Bảng thống kê trực quan hiển thị danh sách học sinh đã nộp bài, điểm số, và thời gian nộp.
  - Phê duyệt điểm và thêm nhận xét cá nhân cho từng học sinh.
- **Thông báo (Notifications)**: Gửi thông báo tự động cho học sinh khi có đề thi mới.

### 🎓 Dành cho Học sinh (Student)
- **Giao diện làm bài hiện đại**: Bố cục Dashboard chuyên nghiệp, hỗ trợ **Dark Mode/Light Mode** chống mỏi mắt.
- **Theo dõi tiến độ**: Thanh tiến trình (progress bar), bộ đếm ngược thời gian (timer), và danh sách các câu chưa làm/đã đánh dấu (flag).
- **Tự động nộp bài**: Tự động nộp bài khi hết thời gian làm bài.
- **Xem lại kết quả**: Xem lại chi tiết bài làm, câu đúng/câu sai và nhận xét của giáo viên sau khi bài thi được công bố.

---

## 🛠 Công Nghệ Sử Dụng

### Backend (Server)
- **Framework:** Python / Django / Django REST Framework
- **Database:** SQLite (Mặc định cho môi trường phát triển) - Dễ dàng chuyển đổi sang PostgreSQL.
- **Authentication:** JWT (JSON Web Tokens) cho API Authentication.

### Frontend (Client)
- **Framework:** React.js
- **Styling:** CSS thuần (Pure CSS) kết hợp hệ thống CSS Variables để hỗ trợ linh hoạt Light/Dark theme.
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Icons:** React Icons

---

## ⚙️ Hướng Dẫn Cài Đặt (Development Setup)

Dự án được chia thành 2 thư mục chính: `Backend` và `FrontEnd`. Bạn cần chạy cả 2 dịch vụ song song.

### 1. Cài đặt Backend
Mở terminal và trỏ vào thư mục `Backend/core`:

```bash
cd Backend/core

# Tạo môi trường ảo (tùy chọn nhưng khuyến khích)
python -m venv venv
venv\Scripts\activate  # Đối với Windows
# source venv/bin/activate  # Đối với MacOS/Linux

# Cài đặt các thư viện cần thiết
pip install -r requirements.txt

# Chạy migrations để khởi tạo database
python manage.py makemigrations
python manage.py migrate

# Tạo tài khoản Admin (Superuser)
python manage.py createsuperuser

# Chạy server
python manage.py runserver
```
*Backend sẽ chạy tại địa chỉ: `http://localhost:8000`*

### 2. Cài đặt Frontend
Mở một terminal mới và trỏ vào thư mục `FrontEnd/thi_tn_online`:

```bash
cd FrontEnd/thi_tn_online

# Cài đặt các dependencies
npm install
# hoặc yarn install

# Chạy ứng dụng React
npm start
# hoặc yarn start
```
*Frontend sẽ tự động mở trên trình duyệt tại địa chỉ: `http://localhost:3000`*

---

## 📂 Cấu Trúc Thư Mục Chính

```text
ThiTNOnline/
├── Backend/
│   └── core/                 # Thư mục gốc chứa mã nguồn Django
│       ├── api/              # Định nghĩa API routes chung
│       ├── classes/          # App quản lý Lớp học
│       ├── exams/            # App quản lý Đề thi & Câu hỏi
│       ├── notifications/    # App quản lý Thông báo
│       ├── subjects/         # App quản lý Môn học
│       ├── submissions/      # App xử lý Nộp bài & Chấm điểm
│       └── users/            # App quản lý Người dùng & Phân quyền
└── FrontEnd/
    └── thi_tn_online/        # Thư mục gốc của React App
        ├── public/           # Chứa file index.html, file mẫu CSV
        └── src/
            ├── api/          # Các hàm Axios gọi API backend
            ├── components/   # Các UI components dùng chung (Navbar, Layout,...)
            ├── contexts/     # Quản lý State toàn cục (AuthContext, ThemeContext)
            └── pages/        # Các trang chính (Dashboard, ClassDetail, ExamDetail,...)
```

---

## 💡 Hướng Dẫn Nhanh Dành Cho Giáo Viên
1. Đăng nhập bằng tài khoản Admin hoặc Giáo viên.
2. Tại màn hình **Lớp học**, chọn "Tạo Lớp Học".
3. Vào chi tiết Lớp học vừa tạo, ấn "Thêm môn học".
4. Vào môn học, ấn "Tạo đề thi". Điền các thông số như tên, thời gian, hạn nộp.
5. Soạn câu hỏi thủ công hoặc sử dụng nút **Import CSV** (tải file mẫu `mau_import_cau_hoi.csv` có sẵn trên giao diện để điền dữ liệu trước khi import).

---

## 📄 Giấy phép (License)
Dự án được phát triển phục vụ mục đích giáo dục và mã nguồn mở. Mọi đóng góp (pull requests) đều được hoan nghênh!
