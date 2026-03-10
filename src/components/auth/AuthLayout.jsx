import React from 'react';
import './auth.css';

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-page">
            {/* Floating star decorations */}
            <span className="auth-star">⭐</span>
            <span className="auth-star">✨</span>
            <span className="auth-star">⭐</span>
            <span className="auth-star">✨</span>
            <span className="auth-star">⭐</span>

            {/* Left panel: logo + form */}
            <div className="auth-left">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <div className="auth-logo-text">
                        <div className="line1">Trung Tâm Ngoại Ngữ</div>
                        <div className="line2">NP Education</div>
                    </div>
                </div>

                {/* Form content injected here */}
                {children}
            </div>

            {/* Right panel: decorations */}
            <div className="auth-right">
                <div className="auth-deco">
                    <div className="auth-trophy">🏆</div>
                    <div className="auth-deco-stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
                    <div className="auth-deco-text">Chào mừng bạn đến với<br />NP Education</div>
                </div>

                {/* Ribbon SVG */}
                <div className="auth-ribbon">
                    <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
                        <path d="M200 0 Q160 30 180 60 Q200 90 160 120 L200 120 Z"
                            fill="rgba(255,220,50,0.5)" />
                        <path d="M200 0 Q170 40 190 70 Q210 100 180 120 L200 120 Z"
                            fill="rgba(255,220,50,0.3)" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;