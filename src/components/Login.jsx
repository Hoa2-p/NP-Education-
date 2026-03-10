import React, { useState } from 'react';
import { authAPI } from '../api';
import { toast } from 'react-toastify';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login = ({ setAuthUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            return toast.error("Vui lòng nhập đủ email và mật khẩu");
        }

        setLoading(true);
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success(`Đăng nhập thành công, chào ${user.name}!`);
            setAuthUser(user); // Cập nhật state Global App.jsx
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin!');
            console.error('Login Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-header">
                    <h2>Hệ Thống Quản Lý NP Education</h2>
                    <p>Vui lòng đăng nhập để tiếp tục</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email đăng nhập"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                        <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                    </button>

                    <div className="demo-notes">
                        <small><i>Tài khoản Demo (Pass: 123456)</i></small>
                        <br />
                        <small>Admin: admin@np.edu.vn</small> <br />
                        <small>Teacher: teacher_mike@np.edu.vn</small><br />
                        <small>Student: student_an@np.edu.vn</small>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
