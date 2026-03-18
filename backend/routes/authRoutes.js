const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng nhập
router.post('/login', authController.login);

// Đăng ký (Tạo tài khoản mới) - Map với /api/users
router.post('/register', authController.register);

module.exports = router;
