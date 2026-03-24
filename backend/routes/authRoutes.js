const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Đăng nhập
router.post('/login', authController.login);

// Đăng ký (Tạo tài khoản mới) - Map với /api/users
router.post('/register', authController.register);

// Lấy danh sách tất cả người dùng (Admin)
router.get('/all', verifyToken, authController.getAllUsers);

// Thay đổi mật khẩu (yêu cầu đăng nhập)
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
