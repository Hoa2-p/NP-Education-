import React, { useState } from 'react';
import { toast } from 'react-toastify';
import AuthLayout from './AuthLayout';

const ForgotPassword = ({ onBack, onEmailSent }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Vui lòng nhập địa chỉ email.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Địa chỉ email không hợp lệ.');
            return;
        }

        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        toast.success('Đã gửi hướng dẫn đặt lại mật khẩu!');
        onEmailSent(email.trim());
        setLoading(false);
    };

    return (
        <AuthLayout>
            <div className="auth-form-container">
                <h1 className="auth-title">QUÊN MẬT KHẨU?</h1>
                <p className="auth-subtitle">
                    Điền email gắn với tài khoản của bạn để nhận đường dẫn thay đổi mật khẩu.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                    {error && <div className="auth-error">{error}</div>}

                    <div className="auth-field">
                        <label htmlFor="forgot-email">Email</label>
                        <div className="auth-input-wrapper">
                            <input
                                id="forgot-email"
                                className="auth-input"
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Đang gửi...' : 'Tiếp tục'}
                    </button>
                </form>

                <div className="auth-back-link">
                    <button type="button" onClick={onBack}>
                        Quay lại đăng nhập
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
