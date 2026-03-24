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

const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'Error', message: 'Bạn không có quyền truy cập tính năng này' });
        }

        return next();
    };
};

module.exports = {
    verifyToken,
    verifyRole
};
