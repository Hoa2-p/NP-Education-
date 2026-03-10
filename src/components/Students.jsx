import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Filter, GraduationCap, ChevronLeft, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { classAPI } from '../api';

const Students = ({ students, classes, onAddStudent, onDeleteStudent }) => {
    // viewMode: 'classes' | 'list'
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedClassName, setSelectedClassName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', age: '', grade: '', phone: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [classStudents, setClassStudents] = useState([]);

    // classes is now passed via props from App.jsx so we don't need predefinedClasses logic

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!newStudent.name.trim()) {
            toast.error('Vui lòng nhập tên học viên!');
            return;
        }

        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!newStudent.phone || !phoneRegex.test(newStudent.phone)) {
            toast.error('Số điện thoại không hợp lệ (VN)');
            return;
        }

        if (newStudent.age && (newStudent.age < 5 || newStudent.age > 100)) {
            toast.warning('Tuổi học viên có vẻ không đúng?');
        }

        // If adding from a specific class view, auto-fill grade
        const studentToAdd = {
            ...newStudent,
            grade: newStudent.grade || (selectedClass !== 'All' ? selectedClass : '')
        };

        onAddStudent(studentToAdd);
        toast.success(`Đã thêm học viên: ${newStudent.name}`);
        setNewStudent({ name: '', age: '', grade: '', phone: '' });
        setIsAdding(false);
    };

    const handleSelectClass = async (classData) => {
        setSelectedClass(classData.id);
        setSelectedClassName(classData.class_name);
        try {
            const res = await classAPI.getStudents(classData.id);
            setClassStudents(res.data.data);
        } catch (error) {
            console.error("Error fetching students for class:", error);
            toast.error("Lỗi lấy danh sách học viên lớp này");
        }
    };

    const filteredStudents = classStudents.filter(s => {
        const matchesSearch = s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone?.includes(searchTerm);
        return matchesSearch;
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
                            key={cls.id}
                            onClick={() => handleSelectClass(cls)}
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
                                <h3 style={{ fontSize: '1.25rem' }}>{cls.class_name}</h3>
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
                            {selectedClassName}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Danh sách học viên lớp {selectedClassName}</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
                    <Plus size={20} style={{ marginRight: 'var(--space-sm)' }} />
                    Thêm học viên
                </button>
            </div>

            {isAdding && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)', borderLeft: '4px solid var(--primary)' }}>
                    <h3>Thêm học viên vào lớp {selectedClassName}</h3>
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
                            placeholder="Lớp (ID)"
                            value={newStudent.grade || selectedClass}
                            disabled
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
                    </form> // Form Submit cần viết lại tương tác API tạo Enrollments sau
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-md)' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }}
                        placeholder={`Tìm kiếm trong lớp ${selectedClassName}...`}
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
                            <th style={{ padding: 'var(--space-sm)' }}>Email</th>
                            <th style={{ padding: 'var(--space-sm)' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student.student_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)', fontWeight: '500' }}>{student.full_name}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)' }}>-</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)', fontFamily: 'monospace' }}>{student.phone}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)' }}>{student.email || '-'}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-sm)' }}>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Xóa học viên ' + student.full_name + '?')) {
                                                    // onDeleteStudent(student.id); Thêm logic sau
                                                    toast.info('API xoá học viên khỏi lớp chưa có');
                                                }
                                            }}
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent)' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-muted)' }}>
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
