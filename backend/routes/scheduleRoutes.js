const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.use(verifyToken); // Yêu cầu đăng nhập

// Lấy lịch học (Phân quyền sẵn bên trong Controller)
router.get('/', scheduleController.getSchedules);

// Admin tạo buổi học mồi
router.post('/', verifyRole(['Admin']), scheduleController.createSession);

module.exports = router;
