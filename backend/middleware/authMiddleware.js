const jwt = require('jsonwebtoken');

// Middleware xác thực token
const verifyToken = (req, res, next) => {
    // Thường gửi token qua header 'Authorization: Bearer <token>'
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ status: 'Error', message: 'Không tìm thấy token xác thực' });
    }

    const token = authHeader.split(' ')[1]; // Lấy phần sau 'Bearer '
    if (!token) {
        return res.status(403).json({ status: 'Error', message: 'Token không hợp lệ' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.user = decoded; // Lưu thông tin giải mã vào req.user (gồm userId, role...)
        next(); // Cho đi tiếp
    } catch (err) {
        return res.status(401).json({ status: 'Error', message: 'Token hết hạn hoặc không đúng' });
    }
};

// Middleware kiểm tra quyền hạn (Role-based)
const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'Error', message: 'Bạn không có quyền truy cập tính năng này' });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    verifyRole
};
