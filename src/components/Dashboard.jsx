import React from 'react';
import { Users, CalendarCheck, Search } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card" style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>{title}</p>
                <h3 style={{ fontSize: '1.5rem', marginTop: 'var(--space-xs)' }}>{value}</h3>
            </div>
            <div style={{
                padding: 'var(--space-sm)',
                background: `hsl(${color}, 20%, 90%)`,
                color: `hsl(${color}, 70%, 40%)`,
                borderRadius: 'var(--radius-md)'
            }}>
                <Icon size={20} />
            </div>
        </div>
        {trend && (
            <p style={{ fontSize: '0.75rem', color: trend > 0 ? 'var(--secondary)' : 'var(--accent)' }}>
                {trend > 0 ? '+' : ''}{trend}% so với tháng trước
            </p>
        )}
    </div>
);

const Dashboard = () => {
    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Tổng quan</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Chào mừng trở lại, Admin.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    {/* Actions could go here */}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <StatCard title="Tổng số học viên" value="124" icon={Users} color="220" trend={12} />
                <StatCard title="Tỷ lệ chuyên cần" value="92%" icon={CalendarCheck} color="150" trend={2} />
                <StatCard title="Lớp đang hoạt động" value="8" icon={Search} color="330" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <h3>Hoạt động gần đây</h3>
                    <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={16} color="var(--text-muted)" />
                                </div>
                                <div>
                                    <p style={{ fontWeight: '500' }}>Học viên mới đăng ký</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2 giờ trước</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>Thao tác nhanh</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                        <button className="btn btn-primary" style={{ width: '100%' }}>Thêm học viên mới</button>
                        <button className="btn" style={{ width: '100%', border: '1px solid var(--border)' }}>Điểm danh ngay</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
