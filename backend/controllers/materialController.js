const db = require('../config/db');

// Thêm tài liệu cho lớp học (Chỉ Admin/Giáo viên)
exports.uploadMaterial = async (req, res) => {
    try {
        const { class_id, title, file_url } = req.body;
        if (!class_id || !title || !file_url) {
            return res.status(400).json({ status: 'Error', message: 'Thiếu thông tin tài liệu' });
        }

        const [result] = await db.query(
            'INSERT INTO materials (class_id, title, file_url) VALUES (?, ?, ?)',
            [class_id, title, file_url]
        );
        res.status(201).json({ status: 'Success', message: 'Tải tài liệu lên thành công', data: { materialId: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi tải lên tài liệu' });
    }
};

// Lấy danh sách tài liệu của một lớp cụ thể
// Admin/Giáo viên lấy được hết. Học sinh chỉ lấy được tài liệu của lớp mình đang tham gia.
exports.getClassMaterials = async (req, res) => {
    try {
        const classId = req.params.classId;
        const role = req.user.role;
        const userId = req.user.userId;

        if (role === 'Student') {
            // Kiểm tra xem Học sinh này có nằm trong lớp không
            const [enrollments] = await db.query(`
                SELECT e.id FROM enrollments e
                JOIN students s ON e.student_id = s.id
                WHERE e.class_id = ? AND s.user_id = ?
            `, [classId, userId]);

            if (enrollments.length === 0) {
                return res.status(403).json({ status: 'Error', message: 'Bạn không có quyền xem tài liệu của lớp này' });
            }
        }

        // Lấy danh sách tài liệu
        const [materials] = await db.query('SELECT * FROM materials WHERE class_id = ? ORDER BY uploaded_at DESC', [classId]);
        res.status(200).json({ status: 'Success', data: materials });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', message: 'Lỗi lấy danh sách tài liệu' });
    }
};
