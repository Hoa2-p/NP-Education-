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
                <div className="login-logo-area">
                    {/* Simulated Logo - You can replace with actual SVG later */}
                    <div className="logo-icon"></div>
                    <div className="logo-text">
                        <span className="logo-subtitle">TRUNG TÂM NGOẠI NGỮ</span>
                        <h1 className="logo-title">NP EDUCATION</h1>
                    </div>
                </div>

                <div className="login-form-area">
                    <h2 className="login-heading">ĐĂNG NHẬP</h2>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <label>Tài khoản</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="Nhập tên tài khoản"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Mật Khẩu</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="forgot-password">
                            <a href="#">Quên mật khẩu?</a>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>
                </div>
            </div>
            {/* The right side decorative part is handled via CSS background */}
        </div>
    );
};

export default Login;
