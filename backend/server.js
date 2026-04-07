require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// Tự động kiểm tra và cập nhật cấu trúc bảng cho các client cũ chưa chạy migration
db.query("ALTER TABLE class_sessions ADD COLUMN session_type ENUM('Theory', 'Practice', 'Test') DEFAULT 'Theory'")
  .catch(() => { /* Bỏ qua lỗi nếu cột đã tồn tại */ });

const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const materialRoutes = require('./routes/materialRoutes');
const studentRoutes = require('./routes/studentRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/homework', homeworkRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'NP Education API is running.'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
