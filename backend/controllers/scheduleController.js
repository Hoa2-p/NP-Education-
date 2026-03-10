const db = require('../config/db');

// Lấy thời khóa biểu (Dựa trên Role của người gọi)
exports.getSchedules = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role; // 'Admin', 'Teacher', 'Student'

        let query = '';
        let params = [];

        if (role === 'Admin') {
            // Admin xem được tất cả lịch
            query = `
                SELECT cs.id AS session_id, c.class_name, b.branch_name, cs.session_date, cs.start_time, cs.end_time, u.full_name AS teacher_name
                FROM class_sessions cs
                JOIN classes c ON cs.class_id = c.id
                JOIN branches b ON c.branch_id = b.id
                JOIN teachers t ON c.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                ORDER BY cs.session_date DESC, cs.start_time ASC
            `;
        } else if (role === 'Teacher') {
            // Teacher chỉ xem lịch các lớp mình được phân công
            query = `
                SELECT cs.id AS session_id, c.class_name, b.branch_name, cs.session_date, cs.start_time, cs.end_time
                FROM class_sessions cs
                JOIN classes c ON cs.class_id = c.id
                JOIN branches b ON c.branch_id = b.id
                JOIN teachers t ON c.teacher_id = t.id
                WHERE t.user_id = ?
                ORDER BY cs.session_date DESC, cs.start_time ASC
            `;
            params = [userId];
        } else if (role === 'Student') {
            // Student chỉ xem lịch các lớp mình đã đóng tiền ghi danh (enrollments)
            query = `
                SELECT cs.id AS session_id, c.class_name, b.branch_name, cs.session_date, cs.start_time, cs.end_time, u.full_name AS teacher_name
                FROM class_sessions cs
                JOIN classes c ON cs.class_id = c.id
                JOIN branches b ON c.branch_id = b.id
                JOIN teachers t ON c.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                JOIN enrollments e ON c.id = e.class_id
                JOIN students s ON e.student_id = s.id
                WHERE s.user_id = ?
                ORDER BY cs.session_date DESC, cs.start_time ASC
            `;
            params = [userId];
        }

        const [schedules] = await db.query(query, params);
        res.status(200).json({ status: 'Success', data: schedules });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi lấy thời khóa biểu' });
    }
};

// Admin tạo buổi học mới (Tạo TKB mồi)
exports.createSession = async (req, res) => {
    try {
        const { class_id, session_date, start_time, end_time } = req.body;
        if (!class_id || !session_date || !start_time || !end_time) {
            return res.status(400).json({ status: 'Error', message: 'Thiếu thông tin buổi học' });
        }

        const [result] = await db.query(
            'INSERT INTO class_sessions (class_id, session_date, start_time, end_time) VALUES (?, ?, ?, ?)',
            [class_id, session_date, start_time, end_time]
        );
        res.status(201).json({ status: 'Success', message: 'Đã thêm buổi học vào TKB', data: { sessionId: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi tạo lịch học' });
    }
};
