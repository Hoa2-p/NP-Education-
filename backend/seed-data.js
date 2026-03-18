require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function seedDummyData() {
    console.log("=== BẮT ĐẦU ĐỔ DỮ LIỆU MỒI (DUMMY DATA) ===");

    try {
        // 1. Dọn Dẹp Dữ Liệu Cũ để làm mượt (Lưu ý: Chỉ dùng trong môi trường Dev)
        console.log("-> Đang dọn dẹp dữ liệu rác cũ...");
        await db.query("SET FOREIGN_KEY_CHECKS = 0;");
        await db.query("TRUNCATE TABLE materials;");
        await db.query("TRUNCATE TABLE class_sessions;");
        await db.query("TRUNCATE TABLE enrollments;");
        await db.query("TRUNCATE TABLE classes;");
        await db.query("TRUNCATE TABLE students;");
        await db.query("TRUNCATE TABLE teachers;");
        await db.query("TRUNCATE TABLE users;");
        await db.query("TRUNCATE TABLE branches;");
        await db.query("SET FOREIGN_KEY_CHECKS = 1;");

        // 2. Tạo nhanh 2 Cơ sở (Branches)
        await db.query("INSERT INTO branches (id, branch_name, address) VALUES (1, 'Cơ sở Quận 1', '123 Sinh Viên'), (2, 'Cơ sở Quận 7', '456 ĐH Tôn Đức Thắng')");

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash("123456", salt);

        // 2.5 Tạo Admin (ID: 1)
        console.log("-> Đang tạo Admin (Mật khẩu chung: 123456)...");
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (1, 'admin@np.edu.vn', ?, 'Admin NP Education', 1)", [hashPass]);

        // 3. Tạo 2 Giáo Viên (ID: 2, 3)
        console.log("-> Đang tạo Giáo Viên (Mật khẩu chung: 123456)...");
        await db.query("INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (2, 'teacher_lan@np.edu.vn', ?, 'Cô Lan English', 4)", [hashPass]);
        await db.query("INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (3, 'teacher_mike@np.edu.vn', ?, 'Thầy Mike IELTS', 4)", [hashPass]);
        await db.query("INSERT IGNORE INTO teachers (user_id, specialized_subject) VALUES (2, 'Học Thuật'), (3, 'Giao Tiếp')");

        // 4. Lấy ID Teachers thực tế sinh ra
        const [teachers] = await db.query("SELECT id FROM teachers ORDER BY id ASC");
        const tLan = teachers[0].id;
        const tMike = teachers[1].id;

        // 5. Tạo 3 Học Sinh (ID: 4, 5, 6)
        console.log("-> Đang tạo Học Sinh (Mật khẩu chung: 123456)...");
        await db.query("INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (4, 'student_an@np.edu.vn', ?, 'Nguyễn Văn An', 5)", [hashPass]);
        await db.query("INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (5, 'student_binh@np.edu.vn', ?, 'Trần Thị Bình', 5)", [hashPass]);
        await db.query("INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (6, 'student_cam@np.edu.vn', ?, 'Lê Hoàng Cầm', 5)", [hashPass]);
        await db.query("INSERT IGNORE INTO students (user_id, phone, parent_phone) VALUES (4, '0901', '0902'), (5, '0903', '0904'), (6, '0905', '0906')");

        // Lấy ID Students thực tế sinh ra
        const [students] = await db.query("SELECT id FROM students ORDER BY id ASC");
        const sAn = students[0].id;
        const sBinh = students[1].id;
        const sCam = students[2].id;

        // 6. Tạo 2 Lớp Học (Classes)
        console.log("-> Đang tạo Lớp Học & Đẩy học sinh vào lớp...");
        const [classRes1] = await db.query("INSERT INTO classes (class_name, branch_id, teacher_id) VALUES ('IELTS Intensive 7.0', 1, ?)", [tMike]);
        const c1 = classRes1.insertId;
        const [classRes2] = await db.query("INSERT INTO classes (class_name, branch_id, teacher_id) VALUES ('TOEIC Cấp Tốc 600+', 2, ?)", [tLan]);
        const c2 = classRes2.insertId;

        // 7. Ghi Danh (Enrollments): An & Bình học Lớp 1. Bình & Cầm học Lớp 2.
        await db.query(`INSERT INTO enrollments (student_id, class_id, enroll_date) VALUES (${sAn}, ${c1}, CURDATE()), (${sBinh}, ${c1}, CURDATE()), (${sBinh}, ${c2}, CURDATE()), (${sCam}, ${c2}, CURDATE())`);

        // 8. Đổ Thời khóa biểu (Class Sessions)
        console.log("-> Đang lên lịch học tự động...");
        await db.query(`
            INSERT INTO class_sessions (class_id, session_date, start_time, end_time) VALUES 
            (${c1}, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '20:00:00'),
            (${c1}, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '18:00:00', '20:00:00'),
            (${c2}, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '21:00:00')
        `);

        // 9. Up vài file Tài liệu Ảo
        console.log("-> Đang tải tài liệu ảo...");
        await db.query(`
            INSERT INTO materials (class_id, title, file_url) VALUES 
            (${c1}, 'Sách IELTS Cambridge 17 PDF', 'https://docs.np.edu.vn/cam17.pdf'),
            (${c2}, 'Từ vựng TOEIC Format Mới', 'https://docs.np.edu.vn/toeic-vocab.pdf')
        `);

        console.log("\n✅ ĐÃ HOÀN TẤT SEED DATA! API BÂY GIỜ GỌI LÊN ĐÃ CÓ FULL DỮ LIỆU MẪU ĐỂ FRONTEND LÀM VIỆC. 🎉");
        console.log(`
👉 Tài khoản Test Frontend (Pass: 123456):
- ADMIN: admin@np.edu.vn
- TEACHER 1: teacher_mike@np.edu.vn
- STUDENT 1: student_an@np.edu.vn (Học IELTS Intensive)
        `);

    } catch (err) {
        console.error("❌ Lỗi nhồi dữ liệu mồi:", err.message);
    } finally {
        process.exit();
    }
}

seedDummyData();
