const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Chỉ Admin và Teacher được upload tài liệu
router.post('/', verifyRole(['Admin', 'Teacher']), materialController.uploadMaterial);

// Tất cả đều được lấy danh sách tài liệu của một lớp (Có phân quyền theo Enrollments bên trong Controller)
router.get('/classes/:classId', materialController.getClassMaterials);

module.exports = router;
