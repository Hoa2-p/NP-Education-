# 📋 Nhận xét & Đánh giá (Review) User Stories - Product Backlog

Mình đã đọc qua file `Product Backlog.xlsx` của bạn. Nhìn chung, bạn đã viết User Stories (US) rất trực quan, tuân thủ đúng cấu trúc chuẩn Agile: *“As a [Role], I want to [Action], so that [Value/Reason]”*.

Các User Stories này bám sát trải nghiệm của **3 đối tượng chính** yếu nhất (Student, Teacher, Admin) và bao phủ được hầu hết các tính năng lõi (Quản lý lớp học, Điểm danh, Bài tập, Chấm điểm).

Tuy nhiên, đối chiếu với **Bản thiết kế Hệ thống (ERD & Architecture)** mà nhóm vừa chốt, mình có vài điểm góp ý (Review) để bạn làm mịn tài liệu hơn:

---

### 1. Thiếu sót về Thực thể (Entities) trong Database
- **Vấn đề:** Trong US số 2 (Student: Access Learning Materials) và số 9 (Teacher: Upload Learning Materials).
- **Phân tích:** Hiện tại trong bản thiết kế Database (ERD) tuần 6, chúng ta **chưa có bảng `materials` (Tài liệu học tập)**. Ta mới chỉ có bảng `homework` (Bài tập) và `submissions` (Bài nộp).
- **Đề xuất:** 
  - *Lựa chọn 1:* Cập nhật ERD thêm 1 bảng `materials (id, class_id, title, file_url, uploaded_at)` để map đúng với US này.
  - *Lựa chọn 2:* Sửa US thành "Upload Assignments/Homework" thay vì "Learning Materials" nếu không định làm tính năng kho tài liệu.

### 2. Thiếu sót về vai trò (Roles)
- **Vấn đề:** File backlog mới chỉ viết cho 3 Role: **Student, Teacher, Admin**.
- **Phân tích:** Trong ma trận phân quyền (RBAC) mình thiết kế thì có tới 5 Role: bao gồm thêm **Academic Staff (Giáo vụ)** và **Customer Service (CSKH)**.
- **Đề xuất:** 
  - Nếu Admin ở đây đại diện luôn cho cả Giáo vụ, thì bạn nên đổi tên "Admin" thành "Admin / Academic Staff".
  - Hoặc nên viết thêm 1-2 User Story cho CSKH (Ví dụ: *"Là CSKH, tôi muốn xem lịch sử học tập của học viên, để tư vấn gia hạn khóa học"*).

### 3. Về tính khả thi thực tế (Acceptance Criteria)
- **Vấn đề:** Cột `Acceptance Criteria` (Tiêu chí nghiệm thu) đang bị bỏ trống (NaN).
- **Đề xuất:** Để được điểm cao ở môn Quản lý Dự án hoặc UI/UX, bạn nên điền thêm 1-2 dòng Criteria thật ngắn ngọn cho các tính năng quan trọng. 
  - *Ví dụ cho tính năng nộp bài (US 3):* "Học sinh có thể upload file PDF/Word dưới 10MB. Hiển thị thông báo Nộp thành công."

---
**💡 Chốt lại:** Bản Backlog này đã đạt 80% chất lượng mức Khá-Giỏi dành cho đồ án. Bạn chỉ cần cân nhắc **thêm bảng Material vào DB** hoặc **bổ sung Role Giáo vụ/CSKH** vào Backlog để nó khớp 100% với file Tài liệu Kỹ thuật là hoàn hảo nhé!
