const db = require('./db');

/**
 * Migration utility to ensure database schema is up-to-date with the code.
 * This is safe to run multiple times (idempotent).
 */
const runMigrations = async () => {
    console.log('--- Trình kiểm tra & đồng bộ hóa Database ---');
    
    try {
        // 1. Kiểm tra bảng courses
        await db.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT
            )
        `);
        console.log('[OK] Bảng courses đã sẵn sàng.');

        // 2. Chèn dữ liệu mẫu cho courses (nếu trống)
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

        // 3. Kiểm tra các cột thiếu trong bảng classes
        const classesColumns = [
            { name: 'class_code', type: 'VARCHAR(50) UNIQUE NOT NULL', after: 'id' },
            { name: 'course_id', type: 'INT', after: 'class_code' },
            { name: 'start_date', type: 'DATE NOT NULL', after: 'teacher_id' },
            { name: 'session_time', type: 'VARCHAR(100) NOT NULL', after: 'start_date' }
        ];

        for (const col of classesColumns) {
            const [rows] = await db.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'classes' 
                AND COLUMN_NAME = ?
            `, [col.name]);

            if (rows.length === 0) {
                console.log(`[Updating] Đang thêm cột ${col.name} vào bảng classes...`);
                await db.query(`ALTER TABLE classes ADD COLUMN ${col.name} ${col.type} AFTER ${col.after}`);
                console.log(`[OK] Đã thêm cột ${col.name}.`);
            }
        }

        // 4. Đảm bảo Khóa ngoại (Foreign Key)
        try {
            await db.query(`ALTER TABLE classes ADD CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL`);
            console.log('[OK] Đã thiết lập Khóa ngoại cho course_id.');
        } catch (err) {
            // Lỗi ER_FK_DUP_NAME (121) có nghĩa là FK đã tồn tại
            if (err.errno !== 121 && err.code !== 'ER_FK_DUP_NAME') {
                 // console.log(`[Info] Khóa ngoại course_id có thể đã tồn tại.`);
            }
        }

        // 5. Kiểm tra cột session_type trong class_sessions (Đã làm trước đó, nhưng đưa vào đây cho tập trung)
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

        console.log('--- Hoàn tất đồng bộ hóa Database ---');
    } catch (error) {
        console.error('!!! Lỗi trong quá trình migration:', error.message);
        // Không throw lỗi để Server vẫn có thể khởi động nếu lỗi không quá nghiêm trọng, 
        // nhưng sẽ giúp dev biết tại sao query bị sập sau này.
    }
};

module.exports = runMigrations;
