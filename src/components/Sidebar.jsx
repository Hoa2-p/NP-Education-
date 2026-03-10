import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, BookOpen, Calendar, LogOut } from 'lucide-react';

const Sidebar = ({ currentView, setView, authUser, setAuthUser }) => {
    // Phân quyền: Học sinh không thấy Quản lý Học viên
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'schedule', label: 'Lịch học', icon: Calendar },
        ...(authUser?.role !== 'Student' ? [{ id: 'students', label: 'Học viên', icon: Users }] : []),
        ...(authUser?.role !== 'Student' ? [{ id: 'attendance', label: 'Điểm danh', icon: CalendarCheck }] : []),
        { id: 'learning', label: 'Tài liệu học tập', icon: BookOpen },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthUser(null);
    };

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
                {authUser && (
                    <div className="user-info" style={{ marginBottom: '1rem', padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{authUser.full_name}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-light)' }}>{authUser.role}</p>
                        <button onClick={handleLogout} style={{ marginTop: '10px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', border: 'none', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer' }}>
                            <LogOut size={16} /> Đăng xuất
                        </button>
                    </div>
                )}
                <p>© 2026 NP Education</p>
            </div>
        </aside>
    );
};

export default Sidebar;
