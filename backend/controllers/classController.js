const db = require('../config/db');

// --- 1. LẤY DANH SÁCH LỚP (Cập nhật sĩ số hiện tại) ---
exports.getAllClasses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role || req.user.roleId; // Chấp nhận cả chữ và số

        // Câu SQL chung để đếm sĩ số: Dùng LEFT JOIN với enrollments để không mất lớp có 0 học sinh
        let baseQuery = `
            SELECT 
                c.id, c.class_name, c.created_at, b.branch_name, 
                u.full_name AS teacher_name,
                COUNT(e.student_id) AS current_enrolled
            FROM classes c
            JOIN branches b ON c.branch_id = b.id
            JOIN teachers t ON c.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            LEFT JOIN enrollments e ON c.id = e.class_id
        `;

        let query = '';
        let params = [];

        if (role === 'Student' || role === 5) {
            query = baseQuery + `
                JOIN enrollments e2 ON c.id = e2.class_id
                JOIN students s ON e2.student_id = s.id
                WHERE s.user_id = ?
                GROUP BY c.id
            `;
            params = [userId];
        } else if (role === 'Teacher' || role === 4) {
            query = baseQuery + `
                WHERE t.user_id = ?
                GROUP BY c.id
            `;
            params = [userId];
        } else {
            // Role Admin (1) - Xem tất cả
            query = baseQuery + ` GROUP BY c.id`;
        }

        const [classes] = await db.query(query, params);
        res.status(200).json({ status: 'Success', data: classes });
    } catch (error) {
        console.error("Lỗi lấy danh sách lớp:", error);
        res.status(500).json({ status: 'Error', message: 'Lỗi lấy danh sách lớp' });
    }
};

// --- 2. GHI DANH HỌC VIÊN (Chặn trùng & Check lỗi) ---
exports.enrollStudent = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        const classId = req.params.id;
        const { student_ids } = req.body; 

        if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
            return res.status(400).json({ status: 'Error', message: 'Vui lòng chọn ít nhất một học viên.' });
        }

        await connection.beginTransaction(); 

        const enrollDate = new Date();
        let addedCount = 0;
        let duplicateCount = 0;

        // backend/controllers/classController.js -> hàm enrollStudent

for (const studentId of student_ids) {
    // Ép kiểu studentId sang số để chắc chắn khớp với Database
    const numericStudentId = Number(studentId); 

    const [existing] = await connection.query(
        'SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?', 
        [numericStudentId, classId]
    );
    
    if (existing.length > 0) {
        duplicateCount++;
        continue; 
    }

    await connection.query(
        'INSERT INTO enrollments (student_id, class_id, enroll_date) VALUES (?, ?, ?)',
        [numericStudentId, classId, enrollDate]
    );
    addedCount++;
}

        // --- LOGIC THÔNG BÁO LỖI CHO NGƯỜI DÙNG ---
        if (addedCount === 0 && duplicateCount > 0) {
            // Trường hợp tất cả đều trùng
            await connection.rollback();
            return res.status(400).json({ 
                status: 'Error', 
                message: student_ids.length === 1 
                    ? 'Học viên này đã có trong danh sách lớp rồi!' 
                    : 'Tất cả học viên được chọn đều đã có trong lớp.' 
            });
        }

        await connection.commit(); 
        
        let finalMessage = `Đã thêm thành công ${addedCount} học viên.`;
        if (duplicateCount > 0) finalMessage += ` (Bỏ qua ${duplicateCount} bạn đã trùng)`;

        res.status(201).json({ status: 'Success', message: finalMessage }); 

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Lỗi API Ghi danh:", error);
        res.status(500).json({ status: 'Error', message: 'Lỗi hệ thống khi ghi danh.' });
    } finally {
        if (connection) connection.release(); 
    }
};

// --- CÁC HÀM CÒN LẠI (GIỮ NGUYÊN) ---
exports.getClassById = async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM classes WHERE id = ?', [req.params.id]);
        res.status(200).json({ status: 'Success', data: result[0] });
    } catch (error) { res.status(500).json({ status: 'Error', message: 'Lỗi' }); }
};

exports.createClass = async (req, res) => {
    try {
        const { class_name, branch_id, teacher_id } = req.body;
        const [result] = await db.query('INSERT INTO classes (class_name, branch_id, teacher_id) VALUES (?, ?, ?)', [class_name, branch_id, teacher_id]);
        res.status(201).json({ status: 'Success', message: 'Tạo lớp thành công' });
    } catch (error) { res.status(500).json({ status: 'Error', message: 'Lỗi' }); }
};

exports.updateClass = async (req, res) => {
    try {
        const { class_name, branch_id, teacher_id } = req.body;
        await db.query('UPDATE classes SET class_name=?, branch_id=?, teacher_id=? WHERE id=?', [class_name, branch_id, teacher_id, req.params.id]);
        res.status(200).json({ status: 'Success', message: 'Cập nhật thành công' });
    } catch (error) { res.status(500).json({ status: 'Error', message: 'Lỗi' }); }
};

exports.deleteClass = async (req, res) => {
    try {
        await db.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
        res.status(200).json({ status: 'Success', message: 'Xóa lớp thành công' });
    } catch (error) { res.status(500).json({ status: 'Error', message: 'Lỗi' }); }
};

exports.getClassStudents = async (req, res) => {
    try {
        const [students] = await db.query(`
            SELECT u.id AS user_id, s.id AS student_id, u.full_name, u.email, s.phone, e.enroll_date
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE e.class_id = ?
        `, [req.params.id]);
        res.status(200).json({ status: 'Success', data: students });
    } catch (error) { res.status(500).json({ status: 'Error', message: 'Lỗi' }); }
};