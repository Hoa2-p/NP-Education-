const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Chỉ dùng middleware token cho tất cả route bên dưới (Phải đăng nhập mới vào được)
router.use(verifyToken);

// === ROLES MỚI (Khớp với DB của Nguyệt) ===
// 1: Admin
// 4: Teacher
// 5: Student
// =========================================

// Lấy ds lớp (Admin [1] và Teacher [4] được xem)
router.get('/', verifyRole([1, 4]), classController.getAllClasses);
router.get('/:id', classController.getClassById);

// Thêm, sửa, xóa lớp (Chỉ Admin [1] có quyền)
router.post('/', verifyRole([1]), classController.createClass);
router.put('/:id', verifyRole([1]), classController.updateClass);
router.delete('/:id', verifyRole([1]), classController.deleteClass);

// Tính năng ghi danh học viên US6 (Chỉ Admin [1] có quyền)
router.post('/:id/enroll', verifyRole([1]), classController.enrollStudent);

// Lấy danh sách học sinh của một lớp (Admin [1] và Teacher [4])
router.get('/:id/students', verifyRole([1, 4]), classController.getClassStudents);

module.exports = router;