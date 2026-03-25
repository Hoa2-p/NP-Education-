import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, GraduationCap, CheckSquare } from 'lucide-react';
import { attendanceAPI } from '../api';
import { toast } from 'react-toastify';

const Attendance = ({ students }) => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [date, setDate] = useState(new Date());
    const [attendance, setAttendance] = useState({});

    // Default classes + any new ones found in student data
    const predefinedClasses = ['IE 1', 'IE 2', 'IE 3'];
    const classes = useMemo(() => {
        const studentGrades = students.map(s => s.grade).filter(Boolean);
        return [...new Set([...predefinedClasses, ...studentGrades])];
    }, [students]);

    // Filter students based on selected class
    const filteredStudents = useMemo(() => {
        if (!selectedClass) return [];
        return students.filter(s => s.grade === selectedClass);
    }, [students, selectedClass]);

    useEffect(() => {
        if (selectedClass) {
            fetchAttendance();
        }
    }, [date, selectedClass]);

    const fetchAttendance = async () => {
        try {
            const res = await attendanceAPI.getAll();
            const dateStr = date.toISOString().split('T')[0];
            const todaysRecords = res.data.filter(r => r.date === dateStr);
            const statusMap = {};
            todaysRecords.forEach(r => {
                statusMap[r.StudentId] = r.status;
            });
            setAttendance(statusMap);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusChange = async (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));

        try {
            const dateStr = date.toISOString().split('T')[0];
            await attendanceAPI.mark({
                studentId,
                date: dateStr,
                status
            });
        } catch (err) {
            console.error('Lỗi điểm danh:', err);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const changeDate = (days) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        setDate(newDate);
        // setAttendance({}); // keep cached or refetch? Refetch triggered by useEffect
    };

    // 1. CLASS SELECTION VIEW
    if (!selectedClass) {
        return (
            <div style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <div>
                        <h1>Điểm danh</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Chọn lớp để điểm danh.</p>
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
                                borderTop: '4px solid var(--secondary)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ padding: 'var(--space-md)', borderRadius: '50%', background: 'hsl(150, 60%, 90%)', color: 'var(--secondary)' }}>
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

    // 2. ATTENDANCE LIST VIEW
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
                        <p style={{ color: 'var(--text-muted)' }}>Điểm danh ngày {formatDate(date)}</p>
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-sm) var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <button onClick={() => changeDate(-1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontWeight: '500' }}>
                        <Calendar size={18} color="var(--primary)" />
                        <span style={{ textTransform: 'capitalize' }}>{formatDate(date)}</span>
                    </div>
                    <button onClick={() => changeDate(1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => {
                        filteredStudents.forEach(s => handleStatusChange(s.id, 'present'));
                        toast.success('Đã điểm danh CÓ MẶT cho cả lớp!');
                    }}
                    style={{ display: 'flex', gap: '8px' }}
                >
                    <CheckSquare size={18} />
                    <span>Có mặt tất cả</span>
                </button>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: 'var(--space-md)' }}>Tên học viên</th>
                            <th style={{ padding: 'var(--space-md)', textAlign: 'center' }}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? filteredStudents.map(student => (
                            <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: 'var(--space-md)', fontWeight: '500' }}>{student.name}</td>
                                <td style={{ padding: 'var(--space-md)', display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)' }}>

                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px' }}>
                                        <div style={{
                                            padding: '4px',
                                            borderRadius: '50%',
                                            border: `2px solid ${attendance[student.id] === 'present' ? 'var(--secondary)' : 'var(--border)'}`,
                                            color: attendance[student.id] === 'present' ? 'var(--secondary)' : 'var(--text-muted)'
                                        }}>
                                            <CheckCircle size={24} fill={attendance[student.id] === 'present' ? 'currentColor' : 'none'} />
                                        </div>
                                        <input type="radio" name={`att-${student.id}`} value="present"
                                            checked={attendance[student.id] === 'present'}
                                            onChange={() => handleStatusChange(student.id, 'present')}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Có mặt</span>
                                    </label>

                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px' }}>
                                        <div style={{
                                            padding: '4px',
                                            borderRadius: '50%',
                                            border: `2px solid ${attendance[student.id] === 'late' ? 'orange' : 'var(--border)'}`,
                                            color: attendance[student.id] === 'late' ? 'orange' : 'var(--text-muted)'
                                        }}>
                                            <Clock size={24} fill={attendance[student.id] === 'late' ? 'currentColor' : 'none'} />
                                        </div>
                                        <input type="radio" name={`att-${student.id}`} value="late"
                                            checked={attendance[student.id] === 'late'}
                                            onChange={() => handleStatusChange(student.id, 'late')}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Muộn</span>
                                    </label>

                                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px' }}>
                                        <div style={{
                                            padding: '4px',
                                            borderRadius: '50%',
                                            border: `2px solid ${attendance[student.id] === 'absent' ? 'var(--accent)' : 'var(--border)'}`,
                                            color: attendance[student.id] === 'absent' ? 'var(--accent)' : 'var(--text-muted)'
                                        }}>
                                            <XCircle size={24} fill={attendance[student.id] === 'absent' ? 'currentColor' : 'none'} />
                                        </div>
                                        <input type="radio" name={`att-${student.id}`} value="absent"
                                            checked={attendance[student.id] === 'absent'}
                                            onChange={() => handleStatusChange(student.id, 'absent')}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Vắng</span>
                                    </label>

                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="2" style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--text-muted)' }}>
                                    Không có học viên trong lớp này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;
