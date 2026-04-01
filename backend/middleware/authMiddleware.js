const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader ? authHeader.split(' ')[1] : null;
    const token = bearerToken || req.query.token;

    if (!token) {
        return res.status(403).json({ status: 'Error', message: 'Không tìm thấy token xác thực' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ status: 'Error', message: 'Token hết hạn hoặc không đúng' });
    }
};

// --- PHẦN NÂNG CẤP THÔNG MINH CHO CẬU VÀ CẢ NHÓM ---
const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ status: 'Error', message: 'Bạn không có quyền truy cập tính năng này' });
        }

        // 1. Kiểm tra theo kiểu cũ của nhóm (Dạng chữ: 'Admin', 'Teacher')
        const hasRoleByName = roles.includes(req.user.role);

        // 2. Kiểm tra theo kiểu mới của Nguyệt (Dạng số: 1, 4)
        const hasRoleById = roles.includes(req.user.roleId);

        // Chỉ cần thỏa mãn 1 trong 2 là cho qua
        if (hasRoleByName || hasRoleById) {
            return next();
        }

        // Nếu không khớp cái nào mới báo lỗi
        return res.status(403).json({ status: 'Error', message: 'Bạn không có quyền truy cập tính năng này' });
    };
};

module.exports = {
    verifyToken,
    verifyRole
};