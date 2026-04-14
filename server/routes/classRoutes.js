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
router.post('/', async (req, res) => {
    try {
        const newClass = await Class.create(req.body);
        res.status(201).json(newClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
