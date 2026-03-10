import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from './auth/AuthLayout';

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin123';

const Login = ({ onLogin, onForgotPassword }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
            return;
        }

        setLoading(true);
        // Simulate async check
        await new Promise((r) => setTimeout(r, 600));

        if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
            localStorage.setItem('np_edu_auth', JSON.stringify({ username, loggedInAt: Date.now() }));
            toast.success('Đăng nhập thành công! Chào mừng bạn trở lại.');
            onLogin();
        } else {
            setError('Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại.');
            toast.error('Đăng nhập thất bại.');
        }
        setLoading(false);
    };

    return (
        <AuthLayout>
            <div className="auth-form-container">
                <h1 className="auth-title">ĐĂNG NHẬP</h1>

                <form onSubmit={handleSubmit} noValidate>
                    {error && <div className="auth-error">{error}</div>}

                    <div className="auth-field">
                        <label htmlFor="auth-username">Tài khoản</label>
                        <div className="auth-input-wrapper">
                            <input
                                id="auth-username"
                                className="auth-input"
                                type="text"
                                placeholder="Nhập tên tài khoản"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="auth-password">Mật Khẩu</label>
                        <div className="auth-input-wrapper">
                            <input
                                id="auth-password"
                                className="auth-input has-toggle"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="auth-toggle-btn"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="auth-forgot">
                        <button type="button" onClick={onForgotPassword}>
                            Quên mật khẩu?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="auth-btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;
