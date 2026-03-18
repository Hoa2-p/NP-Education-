const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Chỉ dùng middleware token cho tất cả route bên dưới (Phải đăng nhập mới vào được)
router.use(verifyToken);

// === ROLES ===
// req.user.role chứa giá trị 'Admin', 'Teacher', 'Student'
// =============

// Lấy ds lớp (Chỉ Admin và Teacher được xem)
router.get('/', verifyRole(['Admin', 'Teacher']), classController.getAllClasses);
router.get('/:id', classController.getClassById);

// Thêm, sửa, xóa lớp (Chỉ Admin có quyền)
router.post('/', verifyRole(['Admin']), classController.createClass);
router.put('/:id', verifyRole(['Admin']), classController.updateClass);
router.delete('/:id', verifyRole(['Admin']), classController.deleteClass);

// Lấy danh sách học sinh của một lớp
router.get('/:id/students', verifyRole(['Admin', 'Teacher']), classController.getClassStudents);

module.exports = router;
