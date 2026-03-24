require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function seedDummyData() {
    console.log('=== BAT DAU DO DU LIEU MAU ===');

    try {
        console.log('-> Dang don dep du lieu cu...');
        await db.query('SET FOREIGN_KEY_CHECKS = 0;');
        await db.query('TRUNCATE TABLE materials;');
        await db.query('TRUNCATE TABLE class_sessions;');
        await db.query('TRUNCATE TABLE enrollments;');
        await db.query('TRUNCATE TABLE classes;');
        await db.query('TRUNCATE TABLE students;');
        await db.query('TRUNCATE TABLE teachers;');
        await db.query('TRUNCATE TABLE users;');
        await db.query('TRUNCATE TABLE branches;');
        await db.query('SET FOREIGN_KEY_CHECKS = 1;');

        await db.query(
            "INSERT INTO branches (id, branch_name, address) VALUES (1, 'Co so Quan 1', '123 Sinh Vien'), (2, 'Co so Quan 7', '456 DH Ton Duc Thang')"
        );

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash('123456', salt);

        console.log('-> Dang tao Admin...');
        await db.query(
            "INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES (1, 'admin@np.edu.vn', ?, 'Admin NP Education', 1)",
            [hashPass]
        );

        console.log('-> Dang tao giao vien...');
        await db.query(
            "INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (2, 'teacher_lan@np.edu.vn', ?, 'Co Lan English', 4)",
            [hashPass]
        );
        await db.query(
            "INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (3, 'teacher_mike@np.edu.vn', ?, 'Thay Mike IELTS', 4)",
            [hashPass]
        );
        await db.query(
            "INSERT IGNORE INTO teachers (user_id, specialized_subject) VALUES (2, 'Hoc Thuat'), (3, 'Giao Tiep')"
        );

        const [teachers] = await db.query('SELECT id FROM teachers ORDER BY id ASC');
        const tLan = teachers[0].id;
        const tMike = teachers[1].id;

        console.log('-> Dang tao hoc sinh...');
        await db.query(
            "INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (4, 'student_an@np.edu.vn', ?, 'Nguyen Van An', 5)",
            [hashPass]
        );
        await db.query(
            "INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (5, 'student_binh@np.edu.vn', ?, 'Tran Thi Binh', 5)",
            [hashPass]
        );
        await db.query(
            "INSERT IGNORE INTO users (id, email, password_hash, full_name, role_id) VALUES (6, 'student_cam@np.edu.vn', ?, 'Le Hoang Cam', 5)",
            [hashPass]
        );
        await db.query(
            "INSERT IGNORE INTO students (user_id, phone, parent_phone) VALUES (4, '0901', '0902'), (5, '0903', '0904'), (6, '0905', '0906')"
        );

        const [students] = await db.query('SELECT id FROM students ORDER BY id ASC');
        const sAn = students[0].id;
        const sBinh = students[1].id;
        const sCam = students[2].id;

        console.log('-> Dang tao lop hoc va ghi danh...');
        const [classRes1] = await db.query(
            "INSERT INTO classes (class_name, branch_id, teacher_id) VALUES ('IELTS Intensive 7.0', 1, ?)",
            [tMike]
        );
        const c1 = classRes1.insertId;
        const [classRes2] = await db.query(
            "INSERT INTO classes (class_name, branch_id, teacher_id) VALUES ('TOEIC Cap Toc 600+', 2, ?)",
            [tLan]
        );
        const c2 = classRes2.insertId;

        await db.query(
            `INSERT INTO enrollments (student_id, class_id, enroll_date)
             VALUES (${sAn}, ${c1}, CURDATE()), (${sBinh}, ${c1}, CURDATE()), (${sBinh}, ${c2}, CURDATE()), (${sCam}, ${c2}, CURDATE())`
        );

        console.log('-> Dang tao lich hoc...');
        await db.query(
            `INSERT INTO class_sessions (class_id, session_date, start_time, end_time) VALUES
             (${c1}, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '20:00:00'),
             (${c1}, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '18:00:00', '20:00:00'),
             (${c2}, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '21:00:00')`
        );

        console.log('\nSeed data hoan tat. Khong con tao tai lieu mau khong mo duoc.');
        console.log(`
Tai khoan test (mat khau: 123456):
- ADMIN: admin@np.edu.vn
- TEACHER 1: teacher_mike@np.edu.vn
- STUDENT 1: student_an@np.edu.vn
        `);
    } catch (error) {
        console.error('Loi seed data:', error.message);
    } finally {
        await db.end();
        process.exit();
    }
}

seedDummyData();
