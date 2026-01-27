import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, BookOpen } from 'lucide-react';

const Sidebar = ({ currentView, setView }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'students', label: 'Học viên', icon: Users },
        { id: 'attendance', label: 'Điểm danh', icon: CalendarCheck },
        { id: 'learning', label: 'Tài liệu học tập', icon: BookOpen },
    ];

    return (
        <div style={{
            width: '250px',
            backgroundColor: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            padding: 'var(--space-md)',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ padding: 'var(--space-md) var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <BookOpen className="w-8 h-8" />
                    <span>NP Education</span>
                </h2>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none' }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                            <li key={item.id} style={{ marginBottom: 'var(--space-xs)' }}>
                                <button
                                    onClick={() => setView(item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-md)',
                                        width: '100%',
                                        padding: 'var(--space-md)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        background: isActive ? 'var(--primary-light)' : 'transparent',
                                        color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: isActive ? '600' : '500',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'var(--background)';
                                            e.currentTarget.style.color = 'var(--text-main)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-muted)';
                                        }
                                    }}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <p>© 2026 NP Education</p>
            </div>
        </div>
    );
};

export default Sidebar;
