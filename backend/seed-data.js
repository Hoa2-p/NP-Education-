require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function seedDummyData() {
    console.log("=== BẮT ĐẦU ĐỔ DỮ LIỆU MỒI (DUMMY DATA) ===");

    try {
        // Kiểm tra xem đã có dữ liệu chưa
        const [userRows] = await db.query("SELECT COUNT(*) as count FROM users");
        const hasData = userRows[0].count > 0;
        const isForce = process.argv.includes('--force');

        if (hasData && !isForce) {
            console.log("-> [SKIP] Database đã có dữ liệu. Bỏ qua bước seed để tránh mất dữ liệu hiện tại.");
            console.log("-> Dùng 'node seed-data.js --force' nếu bạn thực sự muốn xóa cũ và nạp lại.");
            return;
        }

        // 1. Dọn Dẹp Dữ Liệu Cũ (Nếu có --force hoặc DB trống)
        console.log("-> Đang dọn dẹp dữ liệu cũ để nạp mới...");
        await db.query("SET FOREIGN_KEY_CHECKS = 0;");
        await db.query("TRUNCATE TABLE progress_records;");
        await db.query("TRUNCATE TABLE submissions;");
        await db.query("TRUNCATE TABLE homework;");
        await db.query("TRUNCATE TABLE attendance;");
        await db.query("TRUNCATE TABLE learning_materials;");
        await db.query("TRUNCATE TABLE materials;");
        await db.query("TRUNCATE TABLE class_sessions;");
        await db.query("TRUNCATE TABLE enrollments;");
        await db.query("TRUNCATE TABLE classes;");
        await db.query("TRUNCATE TABLE students;");
        await db.query("TRUNCATE TABLE teachers;");
        await db.query("TRUNCATE TABLE users;");
        await db.query("TRUNCATE TABLE branches;");
        await db.query("SET FOREIGN_KEY_CHECKS = 1;");


        // ============================
        // 2. Tạo 4 Cơ sở (Branches)
        // ============================
        console.log("-> Đang tạo Cơ sở...");
        await db.query(`
            INSERT INTO branches (id, branch_name, address) VALUES 
            (1, 'Cơ sở 28N7A',  'Số 28N7A, P. Nguyễn Thị Thập, Nhân Chính, Thanh Xuân, Hà Nội'),
            (2, 'Cơ sở 27N7A',  'Số 27N7A, P. Nguyễn Thị Thập, Nhân Chính, Thanh Xuân, Hà Nội'),
            (3, 'Cơ sở 25N7A', 'Số 25 N7A, P. Nguyễn Thị Thập, Nhân Chính, Thanh Xuân, Hà Nội'),
            (4, 'Cơ sở Hà Đông', 'BT số 3, Dãy 16A7, Làng Việt Kiều Châu Âu, P. Hà Đông, HN'),
            (5, 'Cơ sở Cầu Giấy', 'Tầng 3, 29T2 P. Hoàng Đạo Thúy, Trung Hoà, Cầu Giấy, Hà Nội')
        `);

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash("123456", salt);

        // ============================
        // 3. Tạo Admin (ID: 1)
        // ============================
        console.log("-> Đang tạo Admin (Mật khẩu chung: 123456)...");
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (1, 'admin@np.edu.vn', ?, 'Admin NP Education', 1)", [hashPass]);

        // ============================
        // 4. Tạo 5 Giáo Viên (ID: 2-6)
        // ============================
        console.log("-> Đang tạo 5 Giáo Viên...");
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (2, 'teacher_lan@np.edu.vn', ?, 'Cô Lan English', 4)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (3, 'teacher_mike@np.edu.vn', ?, 'Thầy Mike IELTS', 4)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (4, 'teacher_hoa@np.edu.vn', ?, 'Cô Hoa Speaking', 4)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (5, 'teacher_david@np.edu.vn', ?, 'Thầy David Grammar', 4)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (6, 'teacher_thuy@np.edu.vn', ?, 'Cô Thùy Writing', 4)", [hashPass]);

        await db.query(`
            INSERT INTO teachers (user_id, specialized_subject) VALUES 
            (2, 'TOEIC Listening & Reading'),
            (3, 'IELTS Academic'),
            (4, 'Giao Tiếp & Phát Âm'),
            (5, 'Ngữ Pháp Nâng Cao'),
            (6, 'IELTS Writing & Reading')
        `);

        // Lấy ID Teachers
        const [teachers] = await db.query("SELECT id, user_id FROM teachers ORDER BY id ASC");
        const tLan = teachers[0].id;
        const tMike = teachers[1].id;
        const tHoa = teachers[2].id;
        const tDavid = teachers[3].id;
        const tThuy = teachers[4].id;

        // ============================
        // 5. Tạo 10 Học Sinh (ID: 7-16)
        // ============================
        console.log("-> Đang tạo 10 Học Sinh...");
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (7,  'student_an@np.edu.vn',    ?, 'Nguyễn Văn An',    5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (8,  'student_binh@np.edu.vn',  ?, 'Trần Thị Bình',    5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (9,  'student_cam@np.edu.vn',   ?, 'Lê Hoàng Cầm',     5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (10, 'student_dung@np.edu.vn',  ?, 'Phạm Minh Dũng',   5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (11, 'student_em@np.edu.vn',    ?, 'Võ Thị Hồng Em',   5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (12, 'student_phuc@np.edu.vn',  ?, 'Hoàng Gia Phúc',   5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (13, 'student_giang@np.edu.vn', ?, 'Đặng Thùy Giang',  5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (14, 'student_hieu@np.edu.vn',  ?, 'Bùi Trung Hiếu',   5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (15, 'student_khoa@np.edu.vn',  ?, 'Trương Đăng Khoa',  5)", [hashPass]);
        await db.query("INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (16, 'student_linh@np.edu.vn',  ?, 'Mai Ngọc Linh',     5)", [hashPass]);

        await db.query(`
            INSERT INTO students (user_id, phone, parent_phone) VALUES 
            (7,  '0901111111', '0901111112'),
            (8,  '0902222221', '0902222222'),
            (9,  '0903333331', '0903333332'),
            (10, '0904444441', '0904444442'),
            (11, '0905555551', '0905555552'),
            (12, '0906666661', '0906666662'),
            (13, '0907777771', '0907777772'),
            (14, '0908888881', '0908888882'),
            (15, '0909999991', '0909999992'),
            (16, '0900000001', '0900000002')
        `);

        // Lấy ID Students
        const [students] = await db.query("SELECT id, user_id FROM students ORDER BY id ASC");
        const sAn = students[0].id;
        const sBinh = students[1].id;
        const sCam = students[2].id;
        const sDung = students[3].id;
        const sEm = students[4].id;
        const sPhuc = students[5].id;
        const sGiang = students[6].id;
        const sHieu = students[7].id;
        const sKhoa = students[8].id;
        const sLinh = students[9].id;

        // ============================
        // 6. Tạo 8 Lớp Học (Classes)
        // ============================
        console.log("-> Đang tạo 8 Lớp Học...");
        const [cr1] = await db.query("INSERT INTO classes (class_code, class_name, branch_id, teacher_id, start_date, session_time) VALUES ('IELTS-INT-70', 'IELTS Intensive 7.0', 1, ?, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'T2, T4, T6 18:00-20:00')", [tMike]);
        const c1 = cr1.insertId;
        const [cr2] = await db.query("INSERT INTO classes (class_code, class_name, branch_id, teacher_id, start_date, session_time) VALUES ('TOEIC-CT-600', 'TOEIC Cấp Tốc 600+', 2, ?, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'T3, T5 19:00-21:00')", [tLan]);
        const c2 = cr2.insertId;
        const [cr3] = await db.query("INSERT INTO classes (class_code, class_name, branch_id, teacher_id, start_date, session_time) VALUES ('GT-CB-A2', 'Giao Tiếp Cơ Bản A2', 3, ?, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'T7, CN 08:00-10:00')", [tHoa]);
        const c3 = cr3.insertId;
        const [cr4] = await db.query("INSERT INTO classes (class_code, class_name, branch_id, teacher_id, start_date, session_time) VALUES ('GRAM-B1B2', 'Grammar Master B1-B2', 1, ?, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'T2, T4 14:00-16:00')", [tDavid]);
        const c4 = cr4.insertId;
        const [cr5] = await db.query("INSERT INTO classes (class_code, class_name, branch_id, teacher_id, start_date, session_time) VALUES ('IELTS-WR-12', 'IELTS Writing Task 1 & 2', 4, ?, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'T3, T5 14:00-16:30')", [tThuy]);
        const c5 = cr5.insertId;
        const [cr6] = await db.query("INSERT INTO classes (class_code, class_name, branch_id, teacher_id, start_date, session_time) VALUES ('TOEIC-SW', 'TOEIC Speaking & Writing', 2, ?, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'T6 19:00-21:00')", [tLan]);
        const c6 = cr6.insertId;
        const [cr7] = await db.query("INSERT INTO classes (class_code, class_name, branch_id, teacher_id, start_date, session_time) VALUES ('IPA-PA', 'Phát Âm Chuẩn IPA', 3, ?, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'T7 14:00-16:00')", [tHoa]);
        const c7 = cr7.insertId;
        const [cr8] = await db.query("INSERT INTO classes (class_code, class_name, branch_id, teacher_id, start_date, session_time) VALUES ('IELTS-FD-56', 'IELTS Foundation 5.0-6.0', 4, ?, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'T2, T4 09:00-11:00')", [tMike]);
        const c8 = cr8.insertId;

        // ============================
        // 7. Ghi Danh (Enrollments) - Mỗi lớp 3-5 học sinh
        // ============================
        console.log("-> Đang ghi danh học sinh vào lớp...");
        await db.query(`
            INSERT INTO enrollments (student_id, class_id, enroll_date) VALUES 
            (${sAn},    ${c1}, DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
            (${sBinh},  ${c1}, DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
            (${sCam},   ${c1}, DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
            (${sDung},  ${c1}, DATE_SUB(CURDATE(), INTERVAL 20 DAY)),

            (${sBinh},  ${c2}, DATE_SUB(CURDATE(), INTERVAL 30 DAY)),
            (${sCam},   ${c2}, DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
            (${sEm},    ${c2}, DATE_SUB(CURDATE(), INTERVAL 26 DAY)),
            (${sPhuc},  ${c2}, DATE_SUB(CURDATE(), INTERVAL 22 DAY)),
            (${sGiang}, ${c2}, DATE_SUB(CURDATE(), INTERVAL 18 DAY)),

            (${sDung},  ${c3}, DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
            (${sEm},    ${c3}, DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
            (${sHieu},  ${c3}, DATE_SUB(CURDATE(), INTERVAL 12 DAY)),

            (${sAn},    ${c4}, DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
            (${sPhuc},  ${c4}, DATE_SUB(CURDATE(), INTERVAL 18 DAY)),
            (${sKhoa},  ${c4}, DATE_SUB(CURDATE(), INTERVAL 17 DAY)),
            (${sLinh},  ${c4}, DATE_SUB(CURDATE(), INTERVAL 15 DAY)),

            (${sGiang}, ${c5}, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
            (${sHieu},  ${c5}, DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
            (${sKhoa},  ${c5}, DATE_SUB(CURDATE(), INTERVAL 8 DAY)),

            (${sLinh},  ${c6}, DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
            (${sAn},    ${c6}, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
            (${sDung},  ${c6}, DATE_SUB(CURDATE(), INTERVAL 8 DAY)),

            (${sEm},    ${c7}, DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
            (${sBinh},  ${c7}, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
            (${sPhuc},  ${c7}, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
            (${sLinh},  ${c7}, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),

            (${sKhoa},  ${c8}, DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
            (${sHieu},  ${c8}, DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
            (${sCam},   ${c8}, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
            (${sGiang}, ${c8}, DATE_SUB(CURDATE(), INTERVAL 8 DAY))
        `);

        // ============================
        // 8. Lịch học (Class Sessions) - Mỗi lớp 4-6 buổi trải dài 2 tuần
        // ============================
        console.log("-> Đang lên thời khóa biểu (lịch học 2 tuần)...");
        await db.query(`
            INSERT INTO class_sessions (class_id, session_date, start_time, end_time) VALUES 
            -- Lớp IELTS Intensive 7.0 (T2, T4, T6 tối)
            (${c1}, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '18:00:00', '20:00:00'),
            (${c1}, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '18:00:00', '20:00:00'),
            (${c1}, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '18:00:00', '20:00:00'),
            (${c1}, DATE_ADD(CURDATE(), INTERVAL 0 DAY), '18:00:00', '20:00:00'),
            (${c1}, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00', '20:00:00'),
            (${c1}, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '18:00:00', '20:00:00'),

            -- Lớp TOEIC Cấp Tốc 600+ (T3, T5 tối)
            (${c2}, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '19:00:00', '21:00:00'),
            (${c2}, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '19:00:00', '21:00:00'),
            (${c2}, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '19:00:00', '21:00:00'),
            (${c2}, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', '21:00:00'),
            (${c2}, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '19:00:00', '21:00:00'),

            -- Lớp Giao Tiếp Cơ Bản A2 (T7 sáng, CN sáng)
            (${c3}, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '08:00:00', '10:00:00'),
            (${c3}, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '08:00:00', '10:00:00'),
            (${c3}, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '08:00:00', '10:00:00'),
            (${c3}, DATE_ADD(CURDATE(), INTERVAL 0 DAY), '08:00:00', '10:00:00'),
            (${c3}, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '08:00:00', '10:00:00'),

            -- Lớp Grammar Master (T2, T4 chiều)
            (${c4}, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '14:00:00', '16:00:00'),
            (${c4}, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '14:00:00', '16:00:00'),
            (${c4}, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '14:00:00', '16:00:00'),
            (${c4}, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '16:00:00'),

            -- Lớp IELTS Writing (T3, T5 chiều)
            (${c5}, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '14:00:00', '16:30:00'),
            (${c5}, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '14:00:00', '16:30:00'),
            (${c5}, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:30:00'),
            (${c5}, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '16:30:00'),

            -- Lớp TOEIC Speaking & Writing (T6 tối)
            (${c6}, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '19:00:00', '21:00:00'),
            (${c6}, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '19:00:00', '21:00:00'),
            (${c6}, DATE_ADD(CURDATE(), INTERVAL 11 DAY), '19:00:00', '21:00:00'),

            -- Lớp Phát Âm IPA (T7 chiều)
            (${c7}, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:00:00'),
            (${c7}, DATE_ADD(CURDATE(), INTERVAL 6 DAY), '14:00:00', '16:00:00'),
            (${c7}, DATE_ADD(CURDATE(), INTERVAL 13 DAY), '14:00:00', '16:00:00'),

            -- Lớp IELTS Foundation (T2, T4 sáng)
            (${c8}, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '09:00:00', '11:00:00'),
            (${c8}, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:00:00', '11:00:00'),
            (${c8}, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '09:00:00', '11:00:00'),
            (${c8}, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '11:00:00')
        `);

        // Lấy session IDs để dùng cho attendance
        const [sessions] = await db.query("SELECT id, class_id FROM class_sessions ORDER BY id ASC");

        // ============================
        // 9. Điểm danh (Attendance) - Cho các buổi đã qua
        // ============================
        console.log("-> Đang tạo dữ liệu điểm danh...");
        // Lọc các session của từng lớp
        const sessC1 = sessions.filter(s => s.class_id === c1);
        const sessC2 = sessions.filter(s => s.class_id === c2);
        const sessC3 = sessions.filter(s => s.class_id === c3);
        const sessC4 = sessions.filter(s => s.class_id === c4);

        // Hàm random trạng thái
        const statuses = ['Present', 'Present', 'Present', 'Present', 'Late', 'Absent']; // 67% present, 17% late, 17% absent
        const randStatus = () => statuses[Math.floor(Math.random() * statuses.length)];

        // Điểm danh lớp IELTS Intensive (3 buổi đã qua cho 4 học sinh)
        const attendanceValues = [];
        const pastC1 = sessC1.slice(0, 3); // 3 buổi đã qua
        for (const sess of pastC1) {
            for (const sid of [sAn, sBinh, sCam, sDung]) {
                attendanceValues.push(`(${sess.id}, ${sid}, '${randStatus()}')`);
            }
        }
        // Điểm danh lớp TOEIC (2 buổi đã qua cho 5 học sinh)
        const pastC2 = sessC2.slice(0, 2);
        for (const sess of pastC2) {
            for (const sid of [sBinh, sCam, sEm, sPhuc, sGiang]) {
                attendanceValues.push(`(${sess.id}, ${sid}, '${randStatus()}')`);
            }
        }
        // Điểm danh lớp Giao Tiếp (2 buổi đã qua cho 3 học sinh)
        const pastC3 = sessC3.slice(0, 2);
        for (const sess of pastC3) {
            for (const sid of [sDung, sEm, sHieu]) {
                attendanceValues.push(`(${sess.id}, ${sid}, '${randStatus()}')`);
            }
        }
        // Điểm danh lớp Grammar (2 buổi đã qua cho 4 học sinh)
        const pastC4 = sessC4.slice(0, 2);
        for (const sess of pastC4) {
            for (const sid of [sAn, sPhuc, sKhoa, sLinh]) {
                attendanceValues.push(`(${sess.id}, ${sid}, '${randStatus()}')`);
            }
        }

        if (attendanceValues.length > 0) {
            await db.query(`INSERT INTO attendance (session_id, student_id, status) VALUES ${attendanceValues.join(', ')}`);
        }

        // ============================
        // 10. Bài tập (Homework)
        // ============================
        console.log("-> Đang tạo bài tập...");
        await db.query(`
            INSERT INTO homework (class_id, title, description, due_date, due_time, attachment_url) VALUES 
            (${c1}, 'IELTS Reading Practice Test 1',        'Hoàn thành Test 1 trong sách Cambridge', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '23:59:00', 'https://docs.np.edu.vn/sample-hw.pdf'),
            (${c1}, 'IELTS Listening - Cambridge 17 Test 2', 'Làm cẩn thận phần Multiple Choice', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '23:59:00', 'https://docs.np.edu.vn/sample-hw.pdf'),
            (${c1}, 'Essay: Advantages of Technology',       'Viết ít nhất 250 từ', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '23:59:00', 'https://docs.np.edu.vn/sample-hw.pdf'),

            (${c2}, 'TOEIC Part 5 - Grammar Practice 50 câu', 'Chú ý các câu hỏi về giới từ', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '23:59:00', ''),
            (${c2}, 'TOEIC Listening Part 1-4 Full Test',     'Luyện nghe bằng tai nghe', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '23:59:00', ''),

            (${c3}, 'Viết đoạn hội thoại tự giới thiệu',     'Luyện tập nói trôi chảy', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '23:59:00', ''),
            (${c3}, 'Nghe & chép chính tả Podcast Episode 3', 'Gửi text đã chép lại', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '23:59:00', ''),

            (${c4}, 'Bài tập Tenses tổng hợp (50 câu)',      'Chú ý hiện tại hoàn thành', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '23:59:00', ''),
            (${c4}, 'Relative Clauses - Chuyển đổi câu',     'Sử dụng mệnh đề quan hệ rút gọn', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '23:59:00', ''),

            (${c5}, 'Viết Task 1: Bar Chart - CO2 Emissions', 'Phân tích số liệu năm 2010 vs 2020', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '23:59:00', ''),
            (${c5}, 'Viết Task 2: Education Topic',           'Brainstorm ý tưởng trước khi viết', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '23:59:00', ''),

            (${c6}, 'Record speaking: Describe your job',     'Ghi âm audio mp3', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '23:59:00', ''),

            (${c7}, 'Phiên âm IPA 30 từ vựng chủ đề Travel', 'Highlight trọng âm', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '23:59:00', ''),
            (${c7}, 'Record: Đọc 5 câu phân biệt /s/ vs /ʃ/', 'Đọc thật rõ âm cuối', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '23:59:00', ''),

            (${c8}, 'IELTS Reading: True/False/Not Given x20', 'Chỉ dùng T/F/NG, không dùng Y/N/NG', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '23:59:00', ''),
            (${c8}, 'Từ vựng Academic Word List - Unit 1',     'Dịch nghĩa và đặt câu', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '23:59:00', '')
        `);

        // Lấy homework IDs
        const [homeworks] = await db.query("SELECT id, class_id, title FROM homework ORDER BY id ASC");

        // ============================
        // 11. Nộp bài (Submissions) - Một số học sinh đã nộp
        // ============================
        console.log("-> Đang tạo dữ liệu nộp bài...");
        const hw1 = homeworks[0].id; // IELTS Reading Practice Test 1 (class c1)
        const hw4 = homeworks[3].id; // TOEIC Part 5 (class c2)
        const hw6 = homeworks[5].id; // Hội thoại tự giới thiệu (class c3)
        const hw8 = homeworks[7].id; // Tenses tổng hợp (class c4)
        const hw10 = homeworks[9].id; // Task 1 Bar Chart (class c5)

        await db.query(`
            INSERT INTO submissions (homework_id, student_id, file_url, score) VALUES 
            (${hw1}, ${sAn},   'https://submit.np.edu.vn/an_ielts_reading1.pdf',    7.5),
            (${hw1}, ${sBinh}, 'https://submit.np.edu.vn/binh_ielts_reading1.pdf',   6.5),
            (${hw1}, ${sCam},  'https://submit.np.edu.vn/cam_ielts_reading1.pdf',    8.0),

            (${hw4}, ${sBinh}, 'https://submit.np.edu.vn/binh_toeic_part5.pdf',      42),
            (${hw4}, ${sEm},   'https://submit.np.edu.vn/em_toeic_part5.pdf',        38),
            (${hw4}, ${sPhuc}, 'https://submit.np.edu.vn/phuc_toeic_part5.pdf',       45),
            (${hw4}, ${sGiang},'https://submit.np.edu.vn/giang_toeic_part5.pdf',      40),

            (${hw6}, ${sDung}, 'https://submit.np.edu.vn/dung_giao_tiep.pdf',        8.0),
            (${hw6}, ${sEm},   'https://submit.np.edu.vn/em_giao_tiep.pdf',          7.0),

            (${hw8}, ${sAn},   'https://submit.np.edu.vn/an_grammar_tenses.pdf',     9.0),
            (${hw8}, ${sKhoa}, 'https://submit.np.edu.vn/khoa_grammar_tenses.pdf',   7.5),
            (${hw8}, ${sLinh}, 'https://submit.np.edu.vn/linh_grammar_tenses.pdf',   8.5),

            (${hw10}, ${sGiang},'https://submit.np.edu.vn/giang_writing_task1.pdf',   6.0),
            (${hw10}, ${sHieu}, 'https://submit.np.edu.vn/hieu_writing_task1.pdf',    6.5)
        `);

        // ============================
        // 12. Tài liệu (Materials) - Mỗi lớp 2-3 tài liệu
        // ============================
        console.log("-> Đang tải tài liệu ảo lên...");
        await db.query(`
            INSERT INTO materials (class_id, title, file_url) VALUES 
            (${c1}, 'Sách IELTS Cambridge 17 PDF',            'https://docs.np.edu.vn/cam17.pdf'),
            (${c1}, 'IELTS Band 7+ Vocabulary List',          'https://docs.np.edu.vn/ielts-vocab-7plus.pdf'),
            (${c1}, 'Chiến thuật làm Reading Passage 3',      'https://docs.np.edu.vn/reading-strategy.pdf'),

            (${c2}, 'Từ vựng TOEIC Format Mới 2024',          'https://docs.np.edu.vn/toeic-vocab.pdf'),
            (${c2}, 'TOEIC Economy LC 1000 Vol.5',            'https://docs.np.edu.vn/toeic-lc-1000.pdf'),
            (${c2}, 'Mẹo làm Part 7 - Double Passage',       'https://docs.np.edu.vn/toeic-part7-tips.pdf'),

            (${c3}, 'English Conversation Daily - Level A2',  'https://docs.np.edu.vn/conversation-a2.pdf'),
            (${c3}, 'Podcast Script EP 1-5',                  'https://docs.np.edu.vn/podcast-scripts.pdf'),

            (${c4}, 'English Grammar in Use - Intermediate',  'https://docs.np.edu.vn/grammar-in-use.pdf'),
            (${c4}, 'Tổng hợp BT Clause & Sentence',         'https://docs.np.edu.vn/clause-exercises.pdf'),

            (${c5}, 'IELTS Writing Samples Band 7-9',         'https://docs.np.edu.vn/writing-samples.pdf'),
            (${c5}, 'Task 1 Templates & Vocabulary',          'https://docs.np.edu.vn/task1-templates.pdf'),

            (${c6}, 'TOEIC Speaking - 90 Common Topics',      'https://docs.np.edu.vn/toeic-speaking-topics.pdf'),

            (${c7}, 'IPA Chart & Audio Guide',                'https://docs.np.edu.vn/ipa-chart.pdf'),
            (${c7}, 'Minimal Pairs Practice Book',            'https://docs.np.edu.vn/minimal-pairs.pdf'),

            (${c8}, 'IELTS Foundation Text Book',             'https://docs.np.edu.vn/ielts-foundation.pdf'),
            (${c8}, 'Academic Word List - 570 Words',         'https://docs.np.edu.vn/awl-570.pdf')
        `);

        // Insert vào bảng learning_materials phiên bản mới
        await db.query(`
            INSERT INTO learning_materials (class_id, name, type, url, description) VALUES 
            (${c1}, 'Sách IELTS Cambridge 17 PDF',            'PDF', 'https://docs.np.edu.vn/cam17.pdf', 'Giáo trình gốc luyện thi Cambridge 17'),
            (${c1}, 'IELTS Band 7+ Vocabulary List',          'PDF', 'https://docs.np.edu.vn/ielts-vocab-7plus.pdf', 'Cẩm nang từ vựng nâng cao mục tiêu 7.0+'),
            (${c1}, 'Chiến thuật làm Reading Passage 3',      'Video', 'https://www.youtube.com/watch?v=sample1', 'Video hướng dẫn chiến thuật xử lý bài khó'),

            (${c2}, 'Từ vựng TOEIC Format Mới 2024',          'PDF', 'https://docs.np.edu.vn/toeic-vocab.pdf', 'Từ vựng bám sát đề thi 2024 mới nhất'),
            (${c2}, 'Mẹo làm Part 7 - Double Passage',       'Video', 'https://www.youtube.com/watch?v=sample2', 'Kỹ năng scan & skim cho đoạn văn kép')
        `);

        // ============================
        // 13. Tiến độ / Đánh giá (Progress Records)
        // ============================
        console.log("-> Đang tạo nhận xét tiến độ học sinh...");
        await db.query(`
            INSERT INTO progress_records (student_id, class_id, feedback) VALUES 
            (${sAn},    ${c1}, 'An có tiến bộ rõ rệt ở phần Reading, đạt 7.5. Cần cải thiện thêm Listening Part 3 & 4.'),
            (${sBinh},  ${c1}, 'Bình cần luyện thêm từ vựng Academic. Reading hiện tại ở mức 6.0-6.5.'),
            (${sCam},   ${c1}, 'Cầm xuất sắc ở cả Reading lẫn Writing. Có khả năng đạt 7.5+ nếu ổn định.'),
            (${sDung},  ${c1}, 'Dũng mới tham gia, đang ở mức 5.5. Cần tập trung vào foundation skills.'),

            (${sBinh},  ${c2}, 'Bình mạnh về Listening, đạt 85/100. Cần bổ sung Reading Part 7.'),
            (${sEm},    ${c2}, 'Em ổn định ở mức 550. Cần nỗ lực thêm để đạt mục tiêu 600+.'),
            (${sPhuc},  ${c2}, 'Phúc tiến bộ nhanh, từ 400 lên 520 sau 2 tuần. Tiềm năng lớn.'),

            (${sDung},  ${c3}, 'Dũng tự tin hơn trong giao tiếp. Phát âm cần cải thiện ở nguyên âm dài.'),
            (${sHieu},  ${c3}, 'Hiếu rất chăm chỉ, tham gia đầy đủ các buổi practice session.'),

            (${sAn},    ${c4}, 'An nắm vững Tenses và Conditionals. Cần ôn thêm Relative Clauses.'),
            (${sLinh},  ${c4}, 'Linh có nền tảng tốt, điểm BT luôn trên 8. Recommended chuyển lên B2.'),

            (${sGiang}, ${c5}, 'Giang viết Task 1 ổn (6.0) nhưng Task 2 cần cải thiện coherence.'),
            (${sKhoa},  ${c8}, 'Khoa đang ở mức 4.5, cần tập trung vào Vocabulary & Grammar cơ bản.'),
            (${sGiang}, ${c8}, 'Giang foundation tốt, dự kiến chuyển lên lớp Intensive sau 1 tháng.')
        `);

        // ============================
        // DONE
        // ============================
        console.log("\n✅ ĐÃ HOÀN TẤT SEED DATA! FULL DỮ LIỆU MẪU CHO TẤT CẢ 13 BẢNG 🎉");
        console.log(`
📊 Tổng kết dữ liệu đã seed:
   - 4 Cơ sở (Branches)
   - 1 Admin + 5 Giáo viên + 10 Học sinh = 16 Users
   - 8 Lớp học (Classes)
   - 30 Ghi danh (Enrollments)
   - 35 Buổi học (Class Sessions)
   - ~40 Bản ghi điểm danh (Attendance)
   - 16 Bài tập (Homework)
   - 14 Bài nộp (Submissions) có điểm
   - 18 Tài liệu (Materials)
   - 14 Nhận xét tiến độ (Progress Records)

👉 Tài khoản Test (Password: 123456):
   - ADMIN:     admin@np.edu.vn
   - TEACHER 1: teacher_mike@np.edu.vn  (IELTS)
   - TEACHER 2: teacher_lan@np.edu.vn   (TOEIC)
   - TEACHER 3: teacher_hoa@np.edu.vn   (Giao Tiếp)
   - TEACHER 4: teacher_david@np.edu.vn (Grammar)
   - TEACHER 5: teacher_thuy@np.edu.vn  (Writing)
   - STUDENT 1: student_an@np.edu.vn    (IELTS + Grammar + TOEIC S&W)
   - STUDENT 2: student_binh@np.edu.vn  (IELTS + TOEIC + Phát Âm)
   - STUDENT 3: student_cam@np.edu.vn   (IELTS + TOEIC + Foundation)
   - ...và 7 học sinh khác
        `);

    } catch (err) {
        console.error("❌ Lỗi nhồi dữ liệu mồi:", err.message);
    } finally {
        process.exit();
    }
}

seedDummyData();
