# Tên Dự án: NP Education Management System

## 1. Tổng quan Dự án (Project Overview)
Ứng dụng quản lý trung tâm tiếng Anh NP Education, hỗ trợ quản lý học viên, điểm danh, xếp lớp, lên thời khóa biểu và cung cấp tài liệu học tập.
Hệ thống bao gồm:
- **Frontend**: ReactJS (Vite), Design System custom (CSS Variables).
- **Backend**: Node.js (Express), tuân thủ RESTful API.
- **Database**: MySQL (tương tác trực tiếp bằng `mysql2`).
- **Authentication**: Xác thực phân quyền bằng `jsonwebtoken` (JWT) và `bcrypt`.

### Các tính năng chính (Key Features)
- **Quản lý Tài khoản (RBAC)**: Phân quyền rõ ràng cho Admin, Giáo viên, và Học sinh.
- **Quản lý Học viên**: Đăng ký, hiển thị danh sách học sinh theo từng lớp.
- **Quản lý Lớp học**: API tạo và quản lý lớp học (Branch, Class).
- **Thời khóa biểu (Schedule)**: Lấy lịch học theo từng đối tượng rành mạch.
- **Tài liệu học tập (Materials)**: Đóng tiền ghi danh lớp nào mới được tải tài liệu lớp đó.

---

## 2. Hướng dẫn Cài đặt & Chạy Local (Setup & Run)

### Yêu cầu (Prerequisites)
- [Node.js](https://nodejs.org/) (v16 trở lên).
- [MySQL Server / XAMPP](https://www.apachefriends.org/) (đã cài đặt và đang chạy ở port 3307 hoặc 3306).

### Khởi tạo Database (Backend)
1. Mở MySQL Workbench, phpMyAdmin hoặc Command Line.
2. Tạo database mới:
   ```sql
   CREATE DATABASE np_education;
   ```
3. Mở terminal, truy cập thư mục `backend` và cài gói:
   ```bash
   cd backend
   npm install
   ```
4. Đổ cấu trúc bảng (Schema):
   Chỉ cần import file `backend/database.sql` vào MySQL Database `np_education` vừa tạo.

### Cấu hình Môi trường (.env)
Tạo file `.env` tại thư mục `backend/` với nội dung cấu hình chuẩn của team:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3307  <-- Tuỳ thuộc vào cấu hình MySQL của bạn
DB_USER=root
DB_PASSWORD=
DB_NAME=np_education
JWT_SECRET=np_edu_secret_key_2026
```

### Sinh dữ liệu mồi tự động (Dummy Data)
Tại thư mục `backend`, chạy lệnh sau để tự động tạo dữ liệu test:
```bash
node seed-data.js
```
*(Lệnh này sẽ tạo sẵn 2 lớp học, Giáo viên, Học sinh, và các File tài liệu ảo).*

### Khởi chạy Backend Server
Từ thư mục `backend/`:
```bash
node server.js
```
*Thông báo `Server is running on port 5000` sẽ xuất hiện.*

---

## 3. Cấu trúc Dự án (Project Structure)
```
np-education/
├── src/                    # Frontend (ReactJS)
│   ├── components/         # Các Widget UI (Dashboard, Schedule...)
│   ├── api.js              # Cấu hình gọi API
│   ├── App.jsx             # Logic chính Frontend
│   └── index.css           # Global Styles
├── backend/                # Backend (Node.js)
│   ├── config/             # Cấu hình kết nối MySQL (db.js)
│   ├── controllers/        # Xử lý Logic (auth, class, schedule...)
│   ├── middleware/         # Xác thực JWT Token và Phân quyền (RBAC)
│   ├── routes/             # Cấu hình API Endpoints
│   ├── database.sql        # File SQL tạo bảng Schema trống
│   ├── seed-data.js        # File rải dữ liệu mồi bằng Node
│   ├── server.js           # Entry point của toàn bộ Server
│   └── generate-postman.js # Tự sinh file cấu hình test API cho Postman
├── .env                    # (Nên đưa vào .gitignore) Biến môi trường
├── package.json            # Quản lý dependencies chung
└── README.md               # Sổ tay dự án này
```
