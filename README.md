# English Learning Center Management System

## 1. Tổng quan Dự án (Project Overview)
Ứng dụng quản lý trung tâm tiếng Anh, hỗ trợ quản lý học viên, điểm danh, xếp lớp và cung cấp tài liệu học tập.
Hệ thống bao gồm:
- **Frontend**: ReactJS (Vite), Design System custom (CSS Variables).
- **Backend**: Node.js (Express), tuân thủ RESTful API.
- **Database**: MySQL (quản lý bằng Sequelize ORM).

### Các tính năng chính (Key Features)
- **Dashboard**: Thống kê tổng quan số lượng học viên, lớp học.
- **Quản lý Học viên**: Thêm, sửa, xóa, hiển thị danh sách học viên.
- **Điểm danh (Attendance)**: Điểm danh theo ngày, lưu trữ lịch sử điểm danh vào Database.
- **Tài liệu học tập (Learning Materials)**: Quản lý danh sách tài liệu (Video, PDF, Sách).
- **Quản lý Lớp học**: Hiển thị danh sách lớp và lịch học.

---

## 2. Hướng dẫn Cài đặt & Chạy Local (Setup & Run)

### Yêu cầu (Prerequisites)
- [Node.js](https://nodejs.org/) (v16 trở lên).
- [MySQL Server](https://dev.mysql.com/downloads/installer/) (đã cài đặt và đang chạy).

### Cấu hình Database
1. Mở MySQL Workbench hoặc Command Line.
2. Tạo database mới:
   ```sql
   CREATE DATABASE english_center;
   ```

### Cài đặt (Installation)
1. Clone hoặc tải source code về máy.
2. Tại thư mục gốc của dự án, mở terminal và chạy:
   ```bash
   npm install
   ```

### Cấu hình Môi trường (.env)
Tạo file `.env` tại thư mục gốc với nội dung:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD  <-- Điền mật khẩu MySQL của bạn vào đây
DB_NAME=english_center
```

### Khởi chạy (Running)
Sử dụng 2 terminal riêng biệt:

**Terminal 1 (Backend - Server):**
```bash
npm run server
```
*Nếu thành công, bạn sẽ thấy thông báo: `MySQL Database Synced` và `Server running on port 5000`.*

**Terminal 2 (Frontend - Client):**
```bash
npm run dev
```
*Truy cập trình duyệt tại địa chỉ: `http://localhost:5173`*

---

## 3. Cấu trúc Dự án (Project Structure)
```
english-center-app/
├── src/                    # Frontend (React)
│   ├── components/         # Các widget UI (Sidebar, Dashboard...)
│   ├── api.js              # Cấu hình gọi API (Axios)
│   ├── App.jsx             # Logic chính Frontend
│   └── index.css           # Global Styles
├── server/                 # Backend (Node.js)
│   ├── config/             # Cấu hình DB
│   ├── models/             # Sequelize Models (Student, Class...)
│   ├── routes/             # API Endpoints
│   └── index.js            # Entry point Server
├── .env                    # Biến môi trường
├── package.json            # Quản lý dependencies
└── README.md               # Tài liệu này
```

