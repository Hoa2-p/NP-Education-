const db = require('../config/db');

// Lấy danh sách tất cả lớp học (Kèm số học sinh đã ghi danh)
exports.getAllClasses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        let query = '';
        let params = [];

        if (role === 'Student') {
            query = `
                SELECT c.id, c.class_name, c.status, c.max_students, c.created_at, 
                       c.branch_id, c.teacher_id,
                       b.branch_name, u.full_name AS teacher_name,
                       (SELECT COUNT(*) FROM enrollments e2 WHERE e2.class_id = c.id) AS student_count
                FROM classes c
                JOIN branches b ON c.branch_id = b.id
                JOIN teachers t ON c.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                JOIN enrollments e ON c.id = e.class_id
                JOIN students s ON e.student_id = s.id
                WHERE s.user_id = ?
            `;
            params = [userId];
        } else if (role === 'Teacher') {
            query = `
                SELECT c.id, c.class_name, c.status, c.max_students, c.created_at, 
                       c.branch_id, c.teacher_id,
                       b.branch_name, u.full_name AS teacher_name,
                       (SELECT COUNT(*) FROM enrollments e2 WHERE e2.class_id = c.id) AS student_count
                FROM classes c
                JOIN branches b ON c.branch_id = b.id
                JOIN teachers t ON c.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                WHERE t.user_id = ?
            `;
            params = [userId];
        } else {
            // Admin: xem tất cả
            query = `
                SELECT c.id, c.class_name, c.status, c.max_students, c.created_at, 
                       c.branch_id, c.teacher_id,
                       b.branch_name, u.full_name AS teacher_name,
                       (SELECT COUNT(*) FROM enrollments e2 WHERE e2.class_id = c.id) AS student_count
                FROM classes c
                JOIN branches b ON c.branch_id = b.id
                JOIN teachers t ON c.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
            `;
        }

        const [classes] = await db.query(query, params);
        res.status(200).json({ status: 'Success', data: classes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi lấy danh sách lớp' });
    }
};

// Lấy 1 lớp theo ID
exports.getClassById = async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT c.*, b.branch_name, u.full_name AS teacher_name,
                   (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id) AS student_count
            FROM classes c
            JOIN branches b ON c.branch_id = b.id
            JOIN teachers t ON c.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE c.id = ?
        `, [req.params.id]);
        if (result.length === 0) return res.status(404).json({ status: 'Error', message: 'Không tìm thấy lớp' });
        res.status(200).json({ status: 'Success', data: result[0] });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Lỗi lấy chi tiết lớp' });
    }
};

// Tạo lớp học mới (Chỉ Admin)
exports.createClass = async (req, res) => {
    try {
        const { class_name, branch_id, teacher_id, status, max_students } = req.body;
        if (!class_name || !branch_id || !teacher_id) {
            return res.status(400).json({ status: 'Error', message: 'Thiếu thông tin tạo lớp' });
        }

        const [result] = await db.query(
            'INSERT INTO classes (class_name, branch_id, teacher_id, status, max_students) VALUES (?, ?, ?, ?, ?)',
            [class_name, branch_id, teacher_id, status || 'active', max_students || 25]
        );
        res.status(201).json({ status: 'Success', message: 'Tạo lớp thành công', data: { classId: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi tạo lớp học' });
    }
};

// Cập nhật lớp học
exports.updateClass = async (req, res) => {
    try {
        const { class_name, branch_id, teacher_id, status, max_students } = req.body;
        await db.query(
            'UPDATE classes SET class_name=?, branch_id=?, teacher_id=?, status=?, max_students=? WHERE id=?',
            [class_name, branch_id, teacher_id, status, max_students, req.params.id]
        );
        res.status(200).json({ status: 'Success', message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Lỗi cập nhật lớp' });
    }
};

// Xóa lớp học
exports.deleteClass = async (req, res) => {
    try {
        await db.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
        res.status(200).json({ status: 'Success', message: 'Xóa lớp thành công' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: 'Lỗi xóa lớp' });
    }
};

// Lấy danh sách Học sinh CỦA MỘT LỚP
exports.getClassStudents = async (req, res) => {
    try {
        const classId = req.params.id;

        // Join Enrollments với Students với Users để lấy full info học sinh
        const [students] = await db.query(`
            SELECT u.id AS user_id, s.id AS student_id, u.full_name, u.email, s.phone, e.enroll_date
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE e.class_id = ?
        `, [classId]);

        res.status(200).json({ status: 'Success', data: students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi kéo danh sách học sinh' });
    }
};

// Lấy danh sách giáo viên (Dùng cho dropdown tạo lớp)
exports.getTeachers = async (req, res) => {
    try {
        const [teachers] = await db.query(`
            SELECT t.id, u.full_name, t.specialized_subject
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            ORDER BY u.full_name ASC
        `);
        res.status(200).json({ status: 'Success', data: teachers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi lấy danh sách giáo viên' });
    }
};

// Lấy danh sách chi nhánh (Dùng cho dropdown tạo lớp)
exports.getBranches = async (req, res) => {
    try {
        const [branches] = await db.query('SELECT * FROM branches ORDER BY branch_name ASC');
        res.status(200).json({ status: 'Success', data: branches });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi lấy danh sách chi nhánh' });
    }
};
