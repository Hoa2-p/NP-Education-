// backend/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// 1. Cổng này phải trỏ về hàm getAllStudents mới thêm
router.get('/', verifyRole([1, 4]), studentController.getAllStudents);

// 2. Cổng này giữ nguyên
router.get('/class/:classId', verifyRole([1, 4]), studentController.getStudentsByClass);

module.exports = router;