const db = require('../config/db');
const upload = require('../config/multer');

// GET /api/homework/classes/:classId — Lấy danh sách bài tập theo lớp
exports.getHomeworkByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        // Lấy student_id nếu là Student
        let studentId = null;
        if (role === 'Student') {
            const [stuRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
            if (stuRows.length > 0) studentId = stuRows[0].id;
        }

        // Lấy danh sách homework + LEFT JOIN submissions của student hiện tại
        const [rows] = await db.query(`
            SELECT 
                h.id, h.title, h.due_date, h.created_at,
                s.id AS submission_id, s.file_url AS submission_file, 
                s.submitted_at, s.score
            FROM homework h
            LEFT JOIN submissions s ON s.homework_id = h.id AND s.student_id = ?
            WHERE h.class_id = ?
            ORDER BY h.due_date DESC
        `, [studentId, classId]);

        const now = new Date();

        const homeworkList = rows.map(hw => {
            const dueDate = new Date(hw.due_date);
            const hasSubmission = !!hw.submission_id;

            // Tính status realtime
            let status;
            if (hasSubmission) {
                status = 'Đã nộp';
            } else if (dueDate >= new Date(now.toDateString())) {
                status = 'Chưa nộp';
            } else {
                status = 'Quá hạn';
            }

            // Tính submission label
            let submissionLabel = null;
            if (hasSubmission && hw.submitted_at) {
                const submittedAt = new Date(hw.submitted_at);
                const deadlineEnd = new Date(dueDate);
                deadlineEnd.setHours(23, 59, 59, 999);
                submissionLabel = submittedAt <= deadlineEnd ? 'Đúng hạn' : 'Nộp muộn';
            }

            return {
                id: hw.id,
                title: hw.title,
                due_date: hw.due_date,
                created_at: hw.created_at,
                status,
                submission_id: hw.submission_id,
                submission_file: hw.submission_file,
                submitted_at: hw.submitted_at,
                score: hw.score,
                submission_label: submissionLabel
            };
        });

        res.json({ status: 'OK', data: homeworkList });
    } catch (error) {
        console.error('getHomeworkByClass error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server khi lấy danh sách bài tập' });
    }
};

// POST /api/homework/:homeworkId/submit — Nộp bài
exports.submitHomework = [
    upload.single('file'),
    async (req, res) => {
        try {
            const { homeworkId } = req.params;
            const userId = req.user.id;

            if (!req.file) {
                return res.status(400).json({ status: 'Error', message: 'Vui lòng chọn file để nộp' });
            }

            // Lấy student_id
            const [stuRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
            if (stuRows.length === 0) {
                return res.status(403).json({ status: 'Error', message: 'Không tìm thấy thông tin học sinh' });
            }
            const studentId = stuRows[0].id;

            // Kiểm tra homework tồn tại
            const [hwRows] = await db.query('SELECT id, class_id, due_date FROM homework WHERE id = ?', [homeworkId]);
            if (hwRows.length === 0) {
                return res.status(404).json({ status: 'Error', message: 'Không tìm thấy bài tập' });
            }
            const homework = hwRows[0];

            // Kiểm tra student có enrolled trong class không
            const [enrollRows] = await db.query(
                'SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?',
                [studentId, homework.class_id]
            );
            if (enrollRows.length === 0) {
                return res.status(403).json({ status: 'Error', message: 'Bạn không thuộc lớp học này' });
            }

            // Tính submission label
            const submittedAt = new Date();
            const dueDate = new Date(homework.due_date);
            dueDate.setHours(23, 59, 59, 999);
            const submissionLabel = submittedAt <= dueDate ? 'Đúng hạn' : 'Nộp muộn';

            const fileUrl = `/uploads/${req.file.filename}`;

            // INSERT hoặc UPDATE nếu đã nộp trước đó
            const [existing] = await db.query(
                'SELECT id FROM submissions WHERE homework_id = ? AND student_id = ?',
                [homeworkId, studentId]
            );

            if (existing.length > 0) {
                await db.query(
                    'UPDATE submissions SET file_url = ?, submitted_at = NOW() WHERE homework_id = ? AND student_id = ?',
                    [fileUrl, homeworkId, studentId]
                );
            } else {
                await db.query(
                    'INSERT INTO submissions (homework_id, student_id, file_url, submitted_at) VALUES (?, ?, ?, NOW())',
                    [homeworkId, studentId, fileUrl]
                );
            }

            res.json({
                status: 'OK',
                message: `Nộp bài thành công — ${submissionLabel}`,
                data: { submission_label: submissionLabel, file_url: fileUrl }
            });
        } catch (error) {
            console.error('submitHomework error:', error);
            res.status(500).json({ status: 'Error', message: 'Lỗi server khi nộp bài' });
        }
    }
];
