const db = require('./db');

/**
 * Migration utility to ensure database schema is up-to-date with the code.
 * This is safe to run multiple times (idempotent).
 */
const runMigrations = async () => {
    console.log('--- Trình kiểm tra & đồng bộ hóa Database ---');
    
    try {
        // ---------------------------------------------------------
        // 1. Đảm bảo các bảng cốt lõi tồn tại (CREATE TABLE IF NOT EXISTS)
        // ---------------------------------------------------------
        
        // 1.1 Roles
        await db.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_name VARCHAR(50) NOT NULL UNIQUE
            )
        `);

        // 1.2 Users
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
            )
        `);

        // 1.3 Students
        await db.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                phone VARCHAR(20),
                parent_phone VARCHAR(20),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 1.4 Teachers
        await db.query(`
            CREATE TABLE IF NOT EXISTS teachers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                specialized_subject VARCHAR(100),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 1.5 Branches
        await db.query(`
            CREATE TABLE IF NOT EXISTS branches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                branch_name VARCHAR(100) NOT NULL,
                address VARCHAR(255)
            )
        `);

        // 1.6 Courses
        await db.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT
            )
        `);

        // 1.7 Classes
        await db.query(`
            CREATE TABLE IF NOT EXISTS classes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_code VARCHAR(50) UNIQUE NOT NULL,
                class_name VARCHAR(100) NOT NULL,
                course_id INT,
                branch_id INT NOT NULL,
                teacher_id INT NOT NULL,
                start_date DATE NOT NULL,
                session_time VARCHAR(100) NOT NULL,
                status ENUM('active', 'upcoming', 'closed') DEFAULT 'active',
                max_students INT DEFAULT 25,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
            )
        `);

        // 1.8 Enrollments
        await db.query(`
            CREATE TABLE IF NOT EXISTS enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                class_id INT NOT NULL,
                enroll_date DATE NOT NULL,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                UNIQUE KEY (student_id, class_id)
            )
        `);

        // 1.9 Class Sessions
        await db.query(`
            CREATE TABLE IF NOT EXISTS class_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                session_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                room VARCHAR(100) DEFAULT 'Phòng học 1',
                status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )
        `);

        // 1.10 Materials (cũ)
        await db.query(`
            CREATE TABLE IF NOT EXISTS materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                file_url VARCHAR(500) NOT NULL,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )
        `);

        // 1.11 Learning Materials (mới - dùng cho LearningMaterials.jsx)
        await db.query(`
            CREATE TABLE IF NOT EXISTS learning_materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                name VARCHAR(200) NOT NULL,
                type VARCHAR(50) DEFAULT 'PDF',
                url VARCHAR(500) NOT NULL DEFAULT '',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
            )
        `);

        console.log('[OK] Hầu hết các bảng cốt lõi đã sẵn sàng hoặc đã được tạo.');

        // ---------------------------------------------------------
        // 2. Chèn dữ liệu mẫu cho các bảng danh mục (nếu trống)
        // ---------------------------------------------------------
        
        // Roles (Cần thiết cho Admin login)
        const [roleRows] = await db.query('SELECT COUNT(*) as count FROM roles');
        if (roleRows[0].count === 0) {
            await db.query(`INSERT INTO roles (id, role_name) VALUES (1, 'Admin'), (2, 'Academic Staff'), (3, 'Customer Service'), (4, 'Teacher'), (5, 'Student')`);
            console.log('[OK] Đã nạp dữ liệu mẫu cho bảng roles.');
        }

        // Courses
        const [courseRows] = await db.query('SELECT COUNT(*) as count FROM courses');
        if (courseRows[0].count === 0) {
            await db.query(`
                INSERT INTO courses (course_name, description) VALUES 
                ("IELTS Foundation", "Cơ bản về IELTS"), 
                ("IELTS Intensive", "Luyện thi IELTS chuyên sâu"), 
                ("General English", "Tiếng Anh tổng quát")
            `);
            console.log('[OK] Đã nạp dữ liệu mẫu cho bảng courses.');
        }

        // ---------------------------------------------------------
        // 3. Kiểm tra và cập nhật các cột (Column Patching)
        // ---------------------------------------------------------

        // 3.1 session_type trong class_sessions
        const [sessionTypeCol] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'class_sessions' 
            AND COLUMN_NAME = 'session_type'
        `);

        if (sessionTypeCol.length === 0) {
            console.log(`[Updating] Đang thêm cột session_type vào bảng class_sessions...`);
            await db.query("ALTER TABLE class_sessions ADD COLUMN session_type ENUM('Theory', 'Practice', 'Test') DEFAULT 'Theory'");
            console.log(`[OK] Đã thêm cột session_type.`);
        }

        // 3.2 Khóa ngoại course_id cho classes (Đảm bảo an toàn)
        try {
            await db.query(`ALTER TABLE classes ADD CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL`);
            // console.log('[OK] Đã thiết lập Khóa ngoại cho course_id.');
        } catch (err) {
            // Lỗi 121: Duplicate key name
        }

        console.log('--- Hoàn tất đồng bộ hóa Database ---');
    } catch (error) {
        console.error('!!! Lỗi trong quá trình migration:', error.message);
    }
};

module.exports = runMigrations;
