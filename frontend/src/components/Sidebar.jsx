import React, { useState } from 'react';
import { LayoutDashboard, Users, CalendarCheck, BookOpen, Calendar, LogOut, DollarSign, BarChart2, Key } from 'lucide-react';
import logo from '../asset/npedu-logo-1.png';
import ChangePasswordModal from './auth/ChangePasswordModal';

const adminMenuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'users', label: 'Quản lí người dùng', icon: Users },
    { id: 'classes', label: 'Lớp học', icon: BookOpen },
    { id: 'finance', label: 'Tài chính', icon: DollarSign },
    { id: 'reports', label: 'Báo cáo', icon: BarChart2 },
];

const teacherMenuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'schedule', label: 'Lịch học', icon: Calendar },
    { id: 'attendance', label: 'Điểm danh', icon: CalendarCheck },
    { id: 'learning', label: 'Tài liệu học tập', icon: BookOpen },
];

const studentMenuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'schedule', label: 'Lịch học', icon: Calendar },
    { id: 'learning', label: 'Tài liệu học tập', icon: BookOpen },
];

const Sidebar = ({ currentView, setView, authUser, setAuthUser }) => {
    const isAdmin = authUser?.role === 'Admin';
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

    const menuItems = isAdmin
        ? adminMenuItems
        : authUser?.role === 'Student'
        ? studentMenuItems
        : teacherMenuItems;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthUser(null);
    };

    if (isAdmin) {
        return (
            <aside className="sidebar sidebar-admin">
                <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'center', padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                    <img src={logo} alt="NP Education" style={{ height: '48px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
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

                <div className="sidebar-admin-footer">
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '0.9rem', flexShrink: 0 }}>
                        {(authUser?.fullName || authUser?.full_name || 'Admin')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {authUser?.fullName || authUser?.full_name || 'Quản trị viên'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {authUser?.email || 'admin@npeducation.edu'}
                        </div>
                    </div>
                    
                </div>
                <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} />
            </aside>
        );
    }

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

            <div className="sidebar-footer" style={{ display: 'flex', gap: '8px' }}>
                
            </div>
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} />
        </aside>
    );
};

export default Sidebar;
