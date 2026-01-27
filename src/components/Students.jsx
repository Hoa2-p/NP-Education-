import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Filter, GraduationCap, ChevronLeft, Users } from 'lucide-react';

const Students = ({ students, onAddStudent, onDeleteStudent }) => {
    // viewMode: 'classes' | 'list'
    const [selectedClass, setSelectedClass] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', age: '', grade: '', phone: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // Default classes + any new ones found in student data
    const predefinedClasses = ['IE 1', 'IE 2', 'IE 3'];
    const classes = useMemo(() => {
        const studentGrades = students.map(s => s.grade).filter(Boolean);
        return [...new Set([...predefinedClasses, ...studentGrades])];
    }, [students]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newStudent.name || !newStudent.phone) return;
        // If adding from a specific class view, auto-fill grade
        const studentToAdd = {
            ...newStudent,
            grade: newStudent.grade || (selectedClass !== 'All' ? selectedClass : '')
        };
        onAddStudent(studentToAdd);
        setNewStudent({ name: '', age: '', grade: '', phone: '' });
        setIsAdding(false);
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm);
        const matchesClass = selectedClass ? s.grade === selectedClass : true;
        return matchesSearch && matchesClass;
    });

    // 1. CLASS SELECTION VIEW
    if (!selectedClass) {
        return (
            <div style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <div>
                        <h1>Danh sách Lớp học</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Chọn lớp để xem danh sách học viên.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
                    {classes.map(cls => (
                        <div
                            key={cls}
                            onClick={() => setSelectedClass(cls)}
                            className="card"
                            style={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gap: 'var(--space-md)',
                                borderTop: '4px solid var(--primary)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ padding: 'var(--space-md)', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                <GraduationCap size={32} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem' }}>{cls}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {students.filter(s => s.grade === cls).length} học viên
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. STUDENT LIST VIEW
    return (
        <div style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <button
                        onClick={() => setSelectedClass(null)}
                        className="btn"
                        style={{ padding: 'var(--space-sm)', color: 'var(--text-muted)' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <GraduationCap size={24} color="var(--text-muted)" />
                            {selectedClass}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Danh sách học viên lớp {selectedClass}</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
                    <Plus size={20} style={{ marginRight: 'var(--space-sm)' }} />
                    Thêm học viên
                </button>
            </div>

            {isAdding && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid var(--primary)' }}>
                    <h3>Thêm học viên vào lớp {selectedClass}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                        <input
                            className="input"
                            placeholder="Họ và tên"
                            value={newStudent.name}
                            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                        />
                        <input
                            className="input"
                            placeholder="Tuổi"
                            type="number"
                            value={newStudent.age}
                            onChange={e => setNewStudent({ ...newStudent, age: e.target.value })}
                        />
                        {/* Hidden Grade Input - Auto-filled but editable */}
                        <input
                            className="input"
                            placeholder="Lớp"
                            value={newStudent.grade || selectedClass}
                            onChange={e => setNewStudent({ ...newStudent, grade: e.target.value })}
                        />
                        <input
                            className="input"
                            placeholder="Số điện thoại"
                            value={newStudent.phone}
                            onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button type="submit" className="btn btn-primary">Lưu</button>
                            <button type="button" className="btn" onClick={() => setIsAdding(false)} style={{ border: '1px solid var(--border)' }}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-md)' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }}
                        placeholder={`Tìm kiếm trong lớp ${selectedClass}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: 'var(--space-sm)' }}>Họ tên</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Tuổi</th>
                            <th style={{ padding: 'var(--space-sm)' }}>SĐT</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)', fontWeight: '500' }}>{student.name}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)' }}>{student.age}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)', fontFamily: 'monospace' }}>{student.phone}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)' }}>
                                        <button onClick={() => onDeleteStudent(student.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent)' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-muted)' }}>
                                    Chưa có học viên nào trong lớp này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Students;
