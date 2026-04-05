const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'np_education',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// --- NGUYỆT TIÊM: ĐOẠN KIỂM TRA LỖI KẾT NỐI ---
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('[DATABASE] Kết nối MySQL thành công!');
        connection.release();
    } catch (err) {
        console.error('[DATABASE] LỖI KẾT NỐI:');
        console.error('- Mã lỗi:', err.code);
        console.error('- Chi tiết:', err.message);
    }
})();
// ----------------------------------------------
module.exports = pool;
