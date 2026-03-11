import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, BookOpen, Calendar, LogOut } from 'lucide-react';
import logo from '../asset/npedu-logo-1.png';

const Sidebar = ({ currentView, setView, authUser, setAuthUser }) => {
    // Phân quyền: Học sinh không thấy Quản lý Học viên
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'schedule', label: 'Lịch học', icon: Calendar },
        ...(authUser?.role === 'Admin' ? [{ id: 'students', label: 'Học viên', icon: Users }] : []),
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
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                <img src={logo} alt="NP Education" style={{ height: '48px', objectFit: 'contain' }} />
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
