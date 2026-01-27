# Yêu cầu hệ thống (Prerequisites)

Để chạy được dự án **NP Education System**, máy tính của bạn cần cài đặt các phần mềm sau:

## 1. Node.js & npm
- **Node.js**: Phiên bản 18.0.0 trở lên (Khuyên dùng bản LTS mới nhất - v20.x hoặc v22.x).
  - Tải tại: [https://nodejs.org/](https://nodejs.org/)
  - Kiểm tra cài đặt: Mở Terminal và gõ `node -v` và `npm -v`.

## 2. MySQL Server
- **MySQL Community Server**: Phiên bản 8.0 trở lên.
  - Tải tại: [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/) (Chọn bản **Installer** cho Windows để dễ cài đặt).
  - **Lưu ý quan trọng**:
    - Khi cài đặt, hãy ghi nhớ mật khẩu của tài khoản `root`.
    - Bạn sẽ cần cập nhật mật khẩu này vào file `.env` của dự án.
- **MySQL Workbench** (Đi kèm trong bộ Installer): Dùng để quản lý database trực quan.

## 3. Kiến thức nền tảng (Dành cho Developer)
- **Frontend**: ReactJS, Vite.
- **Backend**: Node.js, ExpressJS.
- **Database**: MySQL, Sequelize ORM.

## 4. Cấu trúc Database bắt buộc
Để ứng dụng chạy, bạn cần có một database tên là `english_center`.
- Nếu dùng Command Line:
  ```bash
  mysql -u root -p -e "CREATE DATABASE english_center;"
  ```
- Nếu dùng MySQL Workbench:
  - Tạo connection mới.
  - Chạy lệnh SQL: `CREATE DATABASE english_center;`

## 5. Môi trường phát triển (Recommended)
- **Visual Studio Code**: IDE để viết code.
- **Extensions khuyên dùng**:
  - ES7+ React/Redux/React-Native snippets.
  - Prettier - Code formatter.
  - .env (để highlight file cấu hình).
