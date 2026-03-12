import React, { useState } from 'react';
import { Search, Plus, Eye, MoreVertical, Users, BookOpen, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const sampleClasses = [
    { id: 'CLS-001', name: 'IELTS Foundation', teacher: 'Phạm Thị Lan', students: 20, maxStudents: 25, level: 'Cơ bản', status: 'active', schedule: 'T2, T4, T6 • 18:00-20:00' },
    { id: 'CLS-002', name: 'TOEIC 500+', teacher: 'Đặng Văn Hùng', students: 18, maxStudents: 20, level: 'Trung cấp', status: 'active', schedule: 'T3, T5 • 17:30-19:30' },
    { id: 'CLS-003', name: 'Tiếng Anh Giao Tiếp', teacher: 'Nguyễn Thị Hoa', students: 15, maxStudents: 20, level: 'Cơ bản', status: 'active', schedule: 'T2, T5 • 19:00-21:00' },
    { id: 'CLS-004', name: 'Tiếng Anh Trẻ Em G1', teacher: 'Lê Văn Minh', students: 12, maxStudents: 15, level: 'Trẻ em', status: 'upcoming', schedule: 'T7, CN • 09:00-11:00' },
    { id: 'CLS-005', name: 'IELTS Advanced', teacher: 'Phạm Thị Lan', students: 10, maxStudents: 15, level: 'Nâng cao', status: 'active', schedule: 'T2, T4 • 20:00-22:00' },
    { id: 'CLS-006', name: 'Business English', teacher: 'Trần Quang Huy', students: 0, maxStudents: 20, level: 'Nâng cao', status: 'closed', schedule: 'T3, T6 • 18:00-20:00' },
];

const StatusBadge = ({ status }) => {
    const map = {
        active: { label: 'Đang mở', bg: '#d1fae5', color: '#065f46' },
        upcoming: { label: 'Sắp khai giảng', bg: '#dbeafe', color: '#1e40af' },
        closed: { label: 'Đã đóng', bg: '#fee2e2', color: '#991b1b' },
    };
    const s = map[status] || map.closed;
    return (
        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            {s.label}
        </span>
    );
};

const AdminClasses = () => {
    const [search, setSearch] = useState('');

    const filtered = sampleClasses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.teacher.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '10px', background: '#d1fae5', borderRadius: '8px' }}>
                        <BookOpen size={20} color="#1C513E" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>6</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng lớp học</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '8px' }}>
                        <BookOpen size={20} color="#1e40af" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>4</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đang hoạt động</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '8px' }}>
                        <Users size={20} color="#92400e" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>75</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng học viên</div>
                    </div>
                </div>
            </div>

            {/* Search + Add */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: '2.25rem' }}
                        placeholder="Tìm kiếm lớp học, giáo viên..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn" style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)', gap: '6px' }}>
                    <Filter size={15} /> Lọc
                </button>
                <button className="btn btn-primary" style={{ gap: '6px', whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> Tạo lớp học mới
                </button>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>LỚP HỌC</th>
                            <th>GIÁO VIÊN</th>
                            <th>LỊCH HỌC</th>
                            <th>HỌC VIÊN</th>
                            <th>TRẠNG THÁI</th>
                            <th style={{ width: 80 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(cls => (
                            <tr key={cls.id}>
                                <td>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cls.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cls.id} • {cls.level}</div>
                                </td>
                                <td style={{ fontSize: '0.875rem' }}>{cls.teacher}</td>
                                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{cls.schedule}</td>
                                <td>
                                    <div style={{ fontSize: '0.875rem' }}>{cls.students}/{cls.maxStudents}</div>
                                    <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, marginTop: 4, width: 80 }}>
                                        <div style={{ height: '100%', background: '#1C513E', borderRadius: 2, width: `${(cls.students / cls.maxStudents) * 100}%` }} />
                                    </div>
                                </td>
                                <td><StatusBadge status={cls.status} /></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                                            <Eye size={16} />
                                        </button>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    Không tìm thấy lớp học phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Đang hiển thị {filtered.length} lớp học
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn" style={{ padding: '4px 8px', border: '1px solid var(--border)', background: 'white' }}>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="btn" style={{ padding: '4px 12px', border: '1px solid #1C513E', background: '#1C513E', color: 'white', minWidth: 36 }}>1</button>
                        <button className="btn" style={{ padding: '4px 8px', border: '1px solid var(--border)', background: 'white' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminClasses;
