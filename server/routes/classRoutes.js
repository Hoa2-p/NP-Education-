import express from 'express';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
const router = express.Router();

// GET all classes
router.get('/', async (req, res) => {
    try {
        const classes = await Class.findAll({
            // 2. Lấy kèm thông tin học sinh đã ghi danh vào từng lớp
            include: [{
                model: Student,
                as: 'students', // Tên alias này phải khớp với định nghĩa Association
                attributes: ['id'], // Chỉ lấy ID cho nhẹ dữ liệu
                through: { attributes: [] } 
            }]
        });

        // 3. Format lại dữ liệu để trả về đúng Key 'enrolled_student_ids' mà Nguyệt cần
        const formattedClasses = classes.map(cls => {
            const classObj = cls.get({ plain: true });
            return {
                ...classObj,
                // Tạo ra mảng ID: [1, 5, 10...]
                enrolled_student_ids: classObj.students ? classObj.students.map(s => s.id) : []
            };
        });

        // Trả về đúng cấu trúc { status: 'Success', data: [...] } mà Frontend đang chờ
        res.json({ status: 'Success', data: formattedClasses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new class
// POST: Ghi danh học viên vào lớp (Fix lỗi 400)
router.post('/:id/enroll', async (req, res) => {
    try {
        const classId = req.params.id;
        const { student_ids } = req.body;

        const targetClass = await Class.findByPk(classId);
        if (!targetClass) return res.status(404).json({ message: 'Không tìm thấy lớp học' });

        // Logic Sequelize để thêm quan hệ vào bảng Enrollments
        await targetClass.addStudents(student_ids);

        res.json({ status: 'Success', message: 'Ghi danh thành công!' });
    } catch (err) {
        res.status(400).json({ message: 'Dữ liệu không hợp lệ: ' + err.message });
    }
});

export default router;
