# Những điều cần lưu ý cho Hệ thống LMS Mobile & Cloud

## 1. Kiến trúc Mobile-First & Cross-Platform
- **Công nghệ**: Nên tiếp tục sử dụng **React Native** (như đã định hướng) để tái sử dụng logic (API calls, data models) từ Web Backend hiện tại.
- **UI/UX**: Giao diện mobile cần tối ưu cho cảm ứng (touch), font chữ to rõ (như đã đổi sang Nunito/Roboto), và điều hướng đơn giản.
- **Offline Mode**: Ứng dụng mobile nên có khả năng hoạt động offline cơ bản (xem tài liệu đã tải về, xem lịch sử) khi mất mạng.

## 2. Cloud Data Storage (Lưu trữ Đám mây)
- **Database**: Cần migrate MySQL từ Localhost lên Cloud (Google Cloud SQL, AWS RDS hoặc Aiven).
  - *Lưu ý*: Chi phí duy trì server database. Cần cấu hình bảo mật (VPC/Firewall) để chỉ cho phép Backend truy cập.
- **File Storage**: Tài liệu học tập (PDF, Video) không nên lưu trực tiếp trong Database hay Server Disk.
  - *Giải pháp*: Sử dụng **AWS S3**, **Google Cloud Storage** hoặc **Firebase Storage**.

## 3. Real-time Monitoring (Thời gian thực)
- **Công nghệ**: Sử dụng **Socket.io** để kết nối 2 chiều giữa Server và App.
- **Ứng dụng**:
  - Khi giáo viên điểm danh trên Web -> App của phụ huynh/học viên nhận thông báo ngay lập tức (Push Notification).
  - Khi có bài tập mới -> Thông báo popup.

## 4. Role-based Access Control (Phân quyền)
- **Bảo mật**: Cần implement **JWT (JSON Web Tokens)** để xác thực.
- **Phân hệ**:
  - **Admin**: Full quyền.
  - **Teacher**: Chỉ xem/điểm danh lớp mình dạy. Không xóa được dữ liệu hệ thống.
  - **Student**: Chỉ xem lịch học, điểm danh và tài liệu của mình. Không nhìn thấy thông tin bạn khác.

## 5. Scalability (Khả năng mở rộng)
- **Quy mô hiện tại (500-600 học viên, 50 giáo viên)**:
  - **Kiến trúc Monolith (như hiện tại) là LỰA CHỌN TỐT NHẤT**. Nó đơn giản, dễ bảo trì và hoàn toàn chịu tải được mức này (Node.js có thể xử lý hàng nghìn request/giây).
  - Không cần chia nhỏ thành Microservices vì sẽ làm hệ thống phức tạp không cần thiết.
- **Khi nào cần thay đổi?**:
  - Chỉ khi lượng người dùng lên tới hàng **chục nghìn** hoặc khi chức năng Video Streaming quá nặng -> lúc đó mới tách riêng service video.
