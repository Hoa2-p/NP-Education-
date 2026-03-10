import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, BookOpen, Calendar } from 'lucide-react';

const Sidebar = ({ currentView, setView, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'schedule', label: 'Lịch học', icon: Calendar },
        { id: 'students', label: 'Học viên', icon: Users },
        { id: 'attendance', label: 'Điểm danh', icon: CalendarCheck },
        { id: 'learning', label: 'Tài liệu học tập', icon: BookOpen },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <BookOpen className="w-8 h-8" />
                    <span>NP Education</span>
                </h2>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                            <li key={item.id} className="nav-item">
                                <button
                                    onClick={() => setView(item.id)}
                                    className={`nav-btn ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0 }}>© 2026 NP Education</p>
                    {onLogout && (
                        <button className="btn small logout-btn" onClick={onLogout} style={{ marginTop: '6px' }}>
                            Đăng xuất
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
