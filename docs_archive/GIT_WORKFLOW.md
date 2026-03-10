# Quy trình & Tiêu chuẩn Commit Code lên GitHub

Tài liệu này hướng dẫn quy trình tiêu chuẩn để quản lý source code, đảm bảo lịch sử dự án rõ ràng, dễ theo dõi và giảm thiểu lỗi khi làm việc nhóm.

## 1. Tiêu chuẩn trước khi Commit (Pre-commit Checklist)
Trước khi gõ lệnh commit, hãy đảm bảo bạn đã hoàn thành các bước sau:

- **Code phải chạy được**: Đừng bao giờ commit code đang lỗi dở dang làm hỏng project của người khác. Hãy chạy thử (`npm run dev`) để chắc chắn.
- **Dọn dẹp (Clean up)**:
  - Xóa các dòng `console.log` dùng để debug.
  - Xóa code thừa (commented out code) không dùng nữa.
  - Format code cho thẳng hàng ngay ngắn (Dùng Prettier/Eslint).
- **Không chứa file nhạy cảm/rác**:
  - Kiểm tra file `.gitignore` để chắc chắn không commit file `.env`, folder `node_modules`, hay file OS (`.DS_Store`).
- **Review thay đổi**: Chạy `git status` và `git diff` để xem chính xác mình sắp đẩy cái gì lên.

## 2. Nên Commit những gì? (Nguyên tắc Atomic Commits)
Thay vì làm cả ngày rồi commit một lần "Update all", hãy chia nhỏ commit:

- **Mỗi Commit resolve một vấn đề duy nhất**: 
  - Ví dụ: 1 commit để "Sửa lỗi font chữ", 1 commit khác để "Thêm API Login".
  - *Tại sao?* Nếu tính năng mới bị lỗi, ta có thể dễ dàng revert (quay lại) commit đó mà không làm mất các thay đổi khác.
- **Nhóm các file liên quan**: Chỉ add những file liên quan đến tính năng đó thôi.

## 3. Quy cách đặt Commit Message (Conventional Commits)
Viết message rõ ràng để sau này đọc lại còn hiểu. Nên theo format:
`[Loại]: [Mô tả ngắn gọn hành động]`

Các loại (Type) phổ biến:
- `feat`: Tính năng mới (Feature).
  - VD: `feat: Thêm màn hình danh sách học viên`
- `fix`: Sửa lỗi (Bug fix).
  - VD: `fix: Sửa lỗi không lưu được điểm danh`
- `style`: Chỉnh sửa giao diện, format (không đổi logic).
  - VD: `style: Cập nhật màu nút bấm sang xanh`
- `refactor`: Tối ưu code (không thêm tính năng, không sửa lỗi).
  - VD: `refactor: Tối ưu code API students`
- `docs`: Viết tài liệu.
  - VD: `docs: Cập nhật hướng dẫn cài đặt trong README`
- `chore`: Các việc lặt vặt (update package, config).

## 4. Quy trình thực hiện (Commands)

### Bước 1: Kiểm tra trạng thái
```bash
git status
# Xem những file nào đã thay đổi
```

### Bước 2: Thêm file vào vùng chờ (Staging)
```bash
# Thêm file cụ thể (Khuyên dùng)
git add src/components/Students.jsx

# HOẶC thêm tất cả (Chỉ dùng khi chắc chắn mọi file đổi đều LIÊN QUAN đến 1 tính năng)
git add .
```

### Bước 3: Commit
```bash
git commit -m "feat: Thêm bộ lọc lớp học vào màn hình Students"
```

### Bước 4: Đẩy lên Server (Push)
```bash
# Thường chỉ push khi đã hoàn thành một tính năng hoàn chỉnh hoặc cuối buổi làm việc
git push origin main
```

---
*Tuân thủ quy trình này sẽ giúp dự án của bạn chuyên nghiệp hơn và dễ dàng mở rộng sau này!*
