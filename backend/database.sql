-- Khởi tạo Database NP_Education
CREATE DATABASE IF NOT EXISTS np_education DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE np_education;

-- Xóa các bảng cũ nếu chạy lại script (Lưu ý: Phải xóa bảng con trước, bảng cha sau để không vi phạm Khóa ngoại)
DROP TABLE IF EXISTS progress_records;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS homework;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS class_sessions;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- 1. Bảng Phân quyền
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Bảng Người dùng chung
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Bảng Học sinh (Mở rộng từ users)
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Bảng Giáo viên (Mở rộng từ users)
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    specialized_subject VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Bảng Chi nhánh Trung tâm
CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    address VARCHAR(255)
);

-- 6. Bảng Lớp học
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(50),
    class_name VARCHAR(100) NOT NULL,
    course_id INT,
    branch_id INT NOT NULL,
    teacher_id INT NOT NULL,
    start_date DATE,
    session_time VARCHAR(100),
    status ENUM('active', 'upcoming', 'closed') DEFAULT 'active',
    max_students INT DEFAULT 25,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT
);

-- 7. Bảng Ghi danh (Học sinh - Lớp học)
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enroll_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY (student_id, class_id) -- Một học sinh không thể vào cùng 1 lớp 2 lần
);

-- 8. Bảng Thời khóa biểu (Các buổi học)
CREATE TABLE class_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(100) DEFAULT 'Phòng học 1',
    session_type VARCHAR(50) DEFAULT 'Theory',
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 9. Bảng Tài liệu bài giảng
CREATE TABLE learning_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('PDF', 'Video', 'Slide') NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Thêm dữ liệu mẫu cho learning_materials
INSERT INTO learning_materials (class_id, name, type, url) VALUES 
(1, 'Bài 1: Giới thiệu về ReactJS', 'Video', 'https://example.com/videos/react-intro.mp4'),
(1, 'Tài liệu đọc Bài 1 (React Core)', 'PDF', 'https://example.com/pdf/react-core.pdf'),
(1, 'Slide thuyết trình State & Props', 'Slide', 'https://example.com/slides/state-props.pdf');

-- 10. Bảng Điểm danh
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL,
    FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY (session_id, student_id) -- 1 học sinh chỉ có 1 status điểm danh / 1 buổi
);

-- 11. Bảng Bài tập
CREATE TABLE homework (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 12. Bảng Nộp bài tập
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    homework_id INT NOT NULL,
    student_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    score FLOAT DEFAULT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY (homework_id, student_id) -- Mỗi bài tập học sinh nộp 1 lần (hoặc có thể update url)
);

-- 13. Bảng Tiến độ / Đánh giá
CREATE TABLE progress_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    feedback TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Chèn dữ liệu mồi (Seed Data) cho Roles để chuẩn bị khởi tạo user
INSERT INTO roles (role_name) VALUES 
('Admin'), 
('Academic Staff'), 
('Customer Service'), 
('Teacher'), 
('Student');
