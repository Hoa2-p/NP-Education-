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
                {/* Fake SVG logo text styling matching Figma */}
                <h2 className="sidebar-logo">
                    <span className="logo-icon-small"></span>
                    <div className="logo-text-small">
                        <span className="text-sub">TRUNG TÂM NGOẠI NGỮ</span>
                        <span className="text-main">NP EDUCATION</span>
                    </div>
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
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} /> Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
