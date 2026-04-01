const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hàm Đăng ký (Tạo tài khoản)
exports.register = async (req, res) => {
    try {
        const { email, password, full_name, role_name, phone } = req.body;

        // 1. Validate: Kiểm tra các trường bắt buộc
        if (!email || !password || !full_name || !role_name) {
            return res.status(400).json({ status: 'Error', message: 'Vui lòng điền đủ email, password, full_name, role_name' });
        }

        // 2. Validate format email (cơ bản)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: 'Error', message: 'Email không hợp lệ' });
        }

        // 3. Kiểm tra email đã tồn tại chưa
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ status: 'Error', message: 'Email này đã được sử dụng' });
        }

        // 4. Lấy role_id từ role_name (VD: 'Student', 'Teacher', 'Admin')
        const [roles] = await db.query('SELECT id FROM roles WHERE role_name = ?', [role_name]);
        if (roles.length === 0) {
            return res.status(400).json({ status: 'Error', message: 'Role không hợp lệ' });
        }
        const role_id = roles[0].id;

        // 5. Mã hóa mật khẩu với bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Lưu vào bảng users
        const [userResult] = await db.query(
            'INSERT INTO users (email, password_hash, full_name, role_id) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, full_name, role_id]
        );
        const userId = userResult.insertId;

        // 7. Chèn thêm vào bảng tương ứng tuỳ theo Role (Student / Teacher)
        if (role_name === 'Student') {
            await db.query('INSERT INTO students (user_id, phone) VALUES (?, ?)', [userId, phone || null]);
        } else if (role_name === 'Teacher') {
            // Teacher có thể update specialized_subject sau
            await db.query('INSERT INTO teachers (user_id) VALUES (?)', [userId]);
        }

        res.status(201).json({
            status: 'Success',
            message: 'Tạo tài khoản thành công',
            data: { userId, email, full_name, role_name }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server, không thể tạo tài khoản' });
    }
};

// Hàm Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'Error', message: 'Vui lòng cung cấp email và password' });
        }

        // 1. Tìm user theo email, lấy kèm tên Role bằng cách JOIN bảng roles
        const [users] = await db.query(`
            SELECT u.id, u.email, u.password_hash, u.full_name, u.role_id, r.role_name 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
        `, [email]);

        if (users.length === 0) {
            return res.status(401).json({ status: 'Error', message: 'Tài khoản hoặc mật khẩu không đúng' });
        }

        const user = users[0];

        // 2. So sánh mật khẩu bằng bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: 'Error', message: 'Tài khoản hoặc mật khẩu không đúng' });
        }

        // 3. Tạo JWT Token bảo mật
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role_name,
            roleId: user.role_id,
            fullName: user.full_name
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

        res.status(200).json({
            status: 'Success',
            message: 'Đăng nhập thành công',
            token: token,
            user: payload
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server, không thể đăng nhập' });
    }
};
