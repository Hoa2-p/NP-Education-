const express = require('express');
const classController = require('../controllers/classController');
const materialController = require('../controllers/materialController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken);

// Danh sách dropdown cho form tạo lớp
router.get('/teachers', verifyRole(['Admin']), classController.getTeachers);
router.get('/branches', verifyRole(['Admin']), classController.getBranches);
router.get('/courses', verifyRole(['Admin']), classController.getCourses);

router.get('/', verifyRole(['Admin', 'Teacher', 'Student']), classController.getAllClasses);
router.get('/:id/materials', materialController.getClassMaterials);
router.get('/:id', classController.getClassById);

router.post('/', verifyRole(['Admin']), classController.createClass);
router.put('/:id', verifyRole(['Admin']), classController.updateClass);
router.put('/:id/assign-teacher', verifyRole(['Admin']), classController.assignTeacher);
router.delete('/:id', verifyRole(['Admin']), classController.deleteClass);

router.get('/:id/students', verifyRole(['Admin', 'Teacher']), classController.getClassStudents);

module.exports = router;
