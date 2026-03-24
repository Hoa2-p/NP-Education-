const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Định nghĩa đường dẫn: GET /api/students/class/[ID_LỚP]
router.get('/class/:classId', studentController.getStudentsByClass);

module.exports = router;