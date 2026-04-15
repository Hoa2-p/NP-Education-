const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homeworkController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// GET /api/homework — Lấy danh sách bài tập của tất cả lớp
router.get('/', verifyToken, homeworkController.getAllHomework);

// GET /api/homework/classes/:classId — Lấy danh sách bài tập theo lớp (cần token)
router.get('/classes/:classId', verifyToken, homeworkController.getHomeworkByClass);

// POST /api/homework/classes/:classId - Tạo bài tập (chỉ Teacher)
router.post('/classes/:classId', verifyToken, verifyRole(['Teacher']), homeworkController.createHomework);

// POST /api/homework/:homeworkId/submit — Nộp bài (cần token, chỉ Student)
router.post('/:homeworkId/submit', verifyToken, verifyRole(['Student']), homeworkController.submitHomework);

module.exports = router;
