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

---

## 4. Kế hoạch Deploy (Deployment Plan)

### Giai đoạn 1: Deploy Database (Cloud SQL)
- **Tùy chọn**: Sử dụng dịch vụ MySQL Hosting miễn phí (như Aiven, Railway, hoặc Clever Cloud) hoặc cài trên VPS.
- **Hành động**: Export dữ liệu local (`mysqldump`) và import lên Cloud Database. Cập nhật `DB_HOST`, `DB_USER`, `DB_PASSWORD` trong cấu hình production.

### Giai đoạn 2: Deploy Backend (API Layer)
- **Nền tảng**: Render, Railway, hoặc Heroku (Hỗ trợ Node.js tốt).
- **Cấu hình**: Set biến môi trường (Environment Variables) trên server giống file `.env` local nhưng trỏ về Cloud Database.
- **Build**: Backend chạy trực tiếp bằng `node server/index.js` (hoặc dùng PM2 để quản lý process).

### Giai đoạn 3: Deploy Frontend (Static Web App)
- **Nền tảng**: Vercel, Netlify hoặc Firebase Hosting.
- **Build**: Chạy lệnh `npm run build` để tạo thư mục `dist`.
- **Cấu hình**: Đảm bảo Frontend trỏ về URL của Backend đã deploy (thay vì localhost:5000).

### CI/CD (Tự động hóa)
- Thiết lập **GitHub Actions** để tự động chạy test và deploy khi có commit mới vào nhánh `main`.

---

## 5. Mở rộng trong tương lai
- **Authentication**: Thêm đăng nhập/đăng ký (JWT) cho Admin, Giáo viên, Học viên.
- **Mobile App**: Sử dụng React Native để build app mobile dùng chung API Backend hiện tại.
- **Hệ thống Bài tập**: Cho phép nộp bài và chấm điểm trực tuyến.

---

## 6. Cách xem Cấu trúc Database (View Database Schema)

Bạn có thể xem dữ liệu và cấu trúc các bảng (Tables) bằng một trong những cách sau:

### Cách 1: Sử dụng MySQL Workbench (Khuyên dùng)
Vì bạn đã cài MySQL Installer, bạn có sẵn **MySQL Workbench**.
1. Mở **MySQL Workbench**.
2. Kết nối vào `Local instance MySQL80` (nhập mật khẩu của bạn).
3. Ở cột bên trái (Schemas), tìm database **english_center**.
4. Bấm vào mũi tên `>` để mở rộng -> chọn `Tables`.
5. Bấm chuột phải vào bảng bất kỳ (ví dụ `Students`) -> Chọn **Select Rows - Limit 1000** để xem dữ liệu.
6. Bấm chuột phải vào bảng -> Chọn **Table Inspector** để xem cấu trúc cột (Columns), kiểu dữ liệu (Data Types).

### Cách 2: Sử dụng VS Code Extension
1. Cài extension **"MySQL"** hoặc **"Database Client"** trong VS Code.
2. Tạo kết nối mới:
   - Host: `localhost`
   - User: `root`
   - Password: (mật khẩu của bạn)
   - Database: `english_center`
3. Bạn có thể xem trực tiếp các bảng ngay trong VS Code.

### Cách 3: Xem qua Code (Models)
Cấu trúc database được định nghĩa trong thư mục `server/models/`:
- `server/models/Student.js`: Bảng học viên (Tên, Tuổi, Lớp...).
- `server/models/Attendance.js`: Bảng điểm danh (Ngày, Trạng thái...).
- `server/models/Class.js`: Bảng lớp học.
- `server/models/Material.js`: Bảng tài liệu.
