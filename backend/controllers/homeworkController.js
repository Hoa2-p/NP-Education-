const db = require('../config/db');
const upload = require('../config/multer');

// GET /api/homework — Lấy danh sách bài tập của TẤT CẢ lớp (cho option "Tất cả")
exports.getAllHomework = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        let query = '';
        let params = [];

        if (role === 'Student') {
            const [stuRows] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
            const studentId = stuRows.length > 0 ? stuRows[0].id : null;

            query = `
                SELECT 
                    h.id, h.title, h.due_date, h.created_at, h.class_id,
                    s.id AS submission_id, s.file_url AS submission_file, 
                    s.submitted_at, s.score,
                    c.class_name
                FROM homework h
                JOIN enrollments e ON h.class_id = e.class_id
                JOIN classes c ON h.class_id = c.id
                LEFT JOIN submissions s ON s.homework_id = h.id AND s.student_id = ?
                WHERE e.student_id = ?
                ORDER BY h.due_date DESC
            `;
            params = [studentId, studentId];
        } else if (role === 'Teacher') {
            query = `
                SELECT 
                    h.id, h.title, h.due_date, h.created_at, h.class_id,
                    NULL AS submission_id, NULL AS submission_file, 
                    NULL AS submitted_at, NULL AS score,
                    c.class_name
                FROM homework h
                JOIN classes c ON h.class_id = c.id
                JOIN teachers t ON c.teacher_id = t.id
                WHERE t.user_id = ?
                ORDER BY h.due_date DESC
            `;
            params = [userId];
        } else {
            // Admin gets everything
            query = `
                SELECT 
                    h.id, h.title, h.due_date, h.created_at, h.class_id,
                    NULL AS submission_id, NULL AS submission_file, 
                    NULL AS submitted_at, NULL AS score,
                    c.class_name
                FROM homework h
                JOIN classes c ON h.class_id = c.id
                ORDER BY h.due_date DESC
            `;
        }

        const [rows] = await db.query(query, params);
        const now = new Date();

        const homeworkList = rows.map(hw => {
            const dueDate = new Date(hw.due_date);
            const hasSubmission = !!hw.submission_id;

            let status;
            if (hasSubmission) {
                status = 'Đã nộp';
            } else if (dueDate >= new Date(now.toDateString())) {
                status = 'Chưa nộp';
            } else {
                status = 'Quá hạn';
            }

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
                class_id: hw.class_id,
                class_name: hw.class_name,
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
        console.error('getAllHomework error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server khi lấy tất cả bài tập' });
    }
};

// GET /api/homework/classes/:classId — Lấy danh sách bài tập theo lớp
exports.getHomeworkByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.user.userId;
        const role = req.user.role;

        // --- Kiểm tra quyền truy cập lớp ---
        if (role === 'Teacher') {
            const [classes] = await db.query(
                `SELECT c.id FROM classes c 
                 JOIN teachers t ON c.teacher_id = t.id 
                 WHERE c.id = ? AND t.user_id = ?`,
                [classId, userId]
            );
            if (classes.length === 0) {
                return res.status(403).json({ status: 'Error', message: 'Bạn không có quyền xem bài tập của lớp học này.' });
            }
        } else if (role === 'Student') {
            const [enrollments] = await db.query(
                `SELECT e.id FROM enrollments e 
                 JOIN students s ON e.student_id = s.id 
                 WHERE e.class_id = ? AND s.user_id = ?`,
                [classId, userId]
            );
            if (enrollments.length === 0) {
                return res.status(403).json({ status: 'Error', message: 'Bạn không thuộc lớp học này.' });
            }
        }

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

// POST /api/homework/classes/:classId — Tạo bài tập mới (Chỉ Teacher)
exports.createHomework = [
    upload.single('file'),
    async (req, res) => {
        try {
            const { classId } = req.params;
            const { title, description, start_date, due_date, due_time } = req.body;
            const userId = req.user.userId;

            // Kiểm tra field bắt buộc
            if (!title || !description || !start_date || !due_date || !due_time || !req.file) {
                return res.status(400).json({ status: 'Error', message: 'Vui lòng điền đầy đủ các trường thông tin bắt buộc.' });
            }

            // Kiểm tra Title / Description max 200
            if (title.length > 200 || description.length > 200) {
                return res.status(400).json({ status: 'Error', message: 'Tiêu đề hoặc mô tả không được vượt quá 200 ký tự.' });
            }

            // Kiểm tra giáo viên có quyền ở lớp này không
            const [classes] = await db.query(
                `SELECT c.id FROM classes c 
                 JOIN teachers t ON c.teacher_id = t.id 
                 WHERE c.id = ? AND t.user_id = ?`,
                [classId, userId]
            );

            if (classes.length === 0) {
                return res.status(403).json({ status: 'Error', message: 'Bạn không có quyền tạo bài tập cho lớp học này.' });
            }

            // Kiểm tra thời gian (Due Date + Time phải lớn hơn hiện tại)
            const dueDatetime = new Date(`${due_date}T${due_time}`);
            if (dueDatetime <= new Date()) {
                return res.status(400).json({ status: 'Error', message: 'Thời gian bắt đầu không hợp lệ.' }); // Requirements state this exact message
            }

            // Dung lượng tệp (Multer cấu hình default limit nhưng cần tự check thêm hoặc dựa vào err của multer)
            if (req.file.size > 100 * 1024 * 1024) {
                return res.status(400).json({ status: 'Error', message: 'Dung lượng tệp đính kèm vượt quá 100MB.' });
            }

            const attachment_url = `/uploads/${req.file.filename}`;

            // Lưu vào DB
            await db.query(
                `INSERT INTO homework (class_id, title, description, start_date, due_date, due_time, attachment_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [classId, title.trim(), description.trim(), start_date, due_date, due_time, attachment_url]
            );

            res.status(201).json({ status: 'Success', message: 'Tạo bài tập thành công.' });
        } catch (error) {
            console.error('createHomework error:', error);
            res.status(500).json({ status: 'Error', message: 'Lỗi server khi tạo bài tập' });
        }
    }
];

// POST /api/homework/:homeworkId/submit — Nộp bài
exports.submitHomework = [
    upload.single('file'),
    async (req, res) => {
        try {
            const { homeworkId } = req.params;
            const userId = req.user.userId;

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
