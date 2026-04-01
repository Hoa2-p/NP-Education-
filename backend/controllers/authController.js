const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Lấy danh sách tất cả người dùng (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.email, u.full_name, r.role_name,
                   CASE 
                       WHEN r.role_name = 'Student' THEN s.phone
                       ELSE NULL
                   END as phone,
                   u.created_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN students s ON u.id = s.user_id
            ORDER BY u.created_at DESC
        `);

        const getInitials = (name) => {
            if (!name) return '?';
            const parts = name.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return parts[0][0].toUpperCase();
        };

        const formatted = users.map(u => ({
            id: `UID-${u.id}`,
            dbId: u.id,
            name: u.full_name,
            email: u.email,
            phone: u.phone || '--',
            role: u.role_name === 'Student' ? 'Học viên' : u.role_name === 'Teacher' ? 'Giáo viên' : 'Nhân viên',
            roleName: u.role_name,
            grade: '--',
            status: 'active',
            initials: getInitials(u.full_name),
        }));

        res.status(200).json({ status: 'Success', data: formatted });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server, không thể lấy danh sách người dùng' });
    }
};

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

        // 2b. Validate tên không quá dài
        if (full_name.length > 200) {
            return res.status(400).json({ status: 'Error', message: 'Họ và tên không được vượt quá 200 ký tự' });
        }

        // 2c. Validate mật khẩu phức tạp
        const pwdRegex = /^(?=.*[A-Z])(?=.*\d).{8,20}$/;
        if (!pwdRegex.test(password)) {
            return res.status(400).json({ status: 'Error', message: 'Mật khẩu phải từ 8-20 ký tự, có ít nhất 1 chữ hoa và 1 chữ số' });
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
            SELECT u.id, u.email, u.password_hash, u.full_name, r.role_name 
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


// Hàm Thay đổi Mật khẩu (Chủ động)
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ status: 'Error', message: 'Vui lòng cung cấp mật khẩu cũ và mới' });
        }

        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Tài khoản không tồn tại' });
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: 'Error', message: 'Mật khẩu hiện tại không đúng' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({ status: 'Success', message: 'Đổi mật khẩu thành công!' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi server, không thể đổi mật khẩu' });
    }
};

// Hàm Quên Mật khẩu (Gửi email thực tế qua Gmail SMTP)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 'Error', message: 'Vui lòng cung cấp email' });
        }

        // Kiểm tra email có tồn tại trong hệ thống
        const [users] = await db.query('SELECT id, full_name FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ status: 'Error', message: 'Không tìm thấy tài khoản với email này' });
        }

        // Tạo mật khẩu tạm thời (đảm bảo có chữ hoa + số)
        const tempPassword = 'Reset' + Math.random().toString(36).slice(-6).toUpperCase() + Math.floor(Math.random() * 90 + 10);

        // Mã hóa và cập nhật vào Database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, users[0].id]);

        // Cấu hình Nodemailer với Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Nội dung email
        const mailOptions = {
            from: `"NP Education" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Đặt lại mật khẩu - NP Education',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h2 style="color: #1C513E; margin: 0;">🎓 NP Education</h2>
                        <p style="color: #6b7280; margin-top: 4px;">Hệ thống Quản lý Giáo dục</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e5e7eb;" />
                    <p>Xin chào <strong>${users[0].full_name}</strong>,</p>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Mật khẩu mới của bạn là:</p>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: #1C513E; letter-spacing: 2px;">${tempPassword}</span>
                    </div>
                    <p>⚠️ Vui lòng đăng nhập và <strong>đổi mật khẩu ngay</strong> sau khi truy cập hệ thống để đảm bảo an toàn.</p>
                    <p style="color: #6b7280; font-size: 0.85rem;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ quản trị viên ngay lập tức.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 24px;" />
                    <p style="color: #9ca3af; font-size: 0.75rem; text-align: center;">© 2026 NP Education. Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[FORGOT PASSWORD] Đã gửi email đặt lại mật khẩu tới: ${email}`);

        res.status(200).json({
            status: 'Success',
            message: 'Đã gửi mật khẩu mới về email của bạn. Vui lòng kiểm tra hộp thư (đặc biệt thư mục Spam).'
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ status: 'Error', message: 'Lỗi gửi email. Vui lòng thử lại sau.' });
    }
};
