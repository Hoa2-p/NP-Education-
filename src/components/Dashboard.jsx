import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, Search, DollarSign, Bell, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend, trendLabel }) => (
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
            <p style={{ fontSize: '0.75rem', color: trend > 0 ? 'var(--secondary)' : 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} />
                {trend > 0 ? '+' : ''}{trend}% {trendLabel || 'so với tháng trước'}
            </p>
        )}
    </div>
);

const MOCK_REVENUE_DATA = [
    { name: 'T1', revenue: 15 },
    { name: 'T2', revenue: 20 },
    { name: 'T3', revenue: 18 },
    { name: 'T4', revenue: 25 },
    { name: 'T5', revenue: 30 },
    { name: 'T6', revenue: 28 },
];

const Dashboard = ({ setView, authUser, students, classes }) => {
    // Mock notifications (có thể query sau)
    const notifications = [
        { id: 1, text: "Hệ thống đang chạy ổn định.", type: "info" }
    ];

    // Tính toán từ dữ liệu thật
    const studentCount = students ? students.length : 0;
    const classCount = classes ? classes.length : 0;
    // Tỷ lệ fake để demo
    const attendanceRate = studentCount > 0 ? "92%" : "0%";

    return (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Tổng quan</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Chào mừng trở lại, {authUser?.full_name || 'Bạn'}.</p>
                </div>
                <div className="card" style={{ padding: '8px', cursor: 'pointer', position: 'relative' }}>
                    <Bell size={20} color="var(--text-muted)" />
                    <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'red', borderRadius: '50%' }}></span>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                <StatCard title="Tổng số học viên" value={studentCount} icon={Users} color="220" />
                <StatCard title="Tổng Lớp học" value={classCount} icon={Search} color="330" />
                <StatCard title="Tỷ lệ chuyên cần (TB)" value={attendanceRate} icon={CalendarCheck} color="150" />
            </div>

            {/* Charts & Actions Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>

                {/* Revenue Chart */}
                <div className="card" style={{ height: '350px' }}>
                    <h3>Biểu đồ Doanh thu (6 tháng)</h3>
                    <div style={{ width: '100%', height: '100%', marginTop: 'var(--space-md)' }}>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={MOCK_REVENUE_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                    cursor={{ fill: 'var(--background)' }}
                                />
                                <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Schedule & Notifications */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                    {/* Today's Schedule */}
                    <div className="card">
                        <h3>Lớp học hôm nay</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600' }}>IE 1</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>17:30 - 19:00</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', background: '#e6fffa', color: '#106c58', padding: '2px 8px', borderRadius: '4px' }}>Đang học</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '600' }}>IE 3</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>19:15 - 20:45</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', background: '#ebf8ff', color: '#2b6cb0', padding: '2px 8px', borderRadius: '4px' }}>Sắp tới</span>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '4px' }}>
                                <button className="btn" style={{ fontSize: '0.875rem', color: 'var(--primary)' }} onClick={() => setView('schedule')}>Xem lịch chi tiết</button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="card" style={{ flex: 1 }}>
                        <h3>Cần chú ý</h3>
                        <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {notifications.map(notif => (
                                <div key={notif.id} style={{
                                    padding: 'var(--space-sm)',
                                    background: notif.type === 'warning' ? '#fff4e5' : '#e5f6fd',
                                    borderRadius: 'var(--radius-sm)',
                                    color: notif.type === 'warning' ? '#663c00' : '#014361',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                                    {notif.text}
                                </div>
                            ))}
                            <button className="btn" style={{ marginTop: 'var(--space-sm)', fontSize: '0.875rem', color: 'var(--primary)' }}>Xem tất cả</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
