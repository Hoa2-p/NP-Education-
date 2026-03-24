import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, X, Users, BookOpen, Filter, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { classAPI } from '../../api';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
    const map = {
        active: { label: 'Đang mở', bg: '#d1fae5', color: '#065f46' },
        upcoming: { label: 'Sắp khai giảng', bg: '#dbeafe', color: '#1e40af' },
        closed: { label: 'Đã đóng', bg: '#fee2e2', color: '#991b1b' },
    };
    const s = map[status] || map.active;
    return (
        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            {s.label}
        </span>
    );
};

const AdminClasses = ({ classes: propClasses, onRefresh }) => {
    const [search, setSearch] = useState('');
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        class_name: '',
        branch_id: '',
        teacher_id: '',
        status: 'active',
        max_students: 25
    });

    // Lấy dữ liệu lớp học từ API khi component mount
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await classAPI.getAll();
            setClasses(res.data.data || []);
        } catch (error) {
            console.error('Lỗi lấy danh sách lớp:', error);
            toast.error('Không thể tải danh sách lớp học');
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách giáo viên + chi nhánh khi mở modal tạo lớp
    const openCreateModal = async () => {
        try {
            const [teacherRes, branchRes] = await Promise.all([
                classAPI.getTeachers(),
                classAPI.getBranches()
            ]);
            setTeachers(teacherRes.data.data || []);
            setBranches(branchRes.data.data || []);
            setFormData({ class_name: '', branch_id: '', teacher_id: '', status: 'active', max_students: 25 });
            setShowModal(true);
        } catch (error) {
            console.error('Lỗi tải dropdown:', error);
            toast.error('Không thể tải dữ liệu');
        }
    };

    // Tạo lớp mới
    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await classAPI.create(formData);
            toast.success('Tạo lớp thành công!');
            setShowModal(false);
            fetchClasses();
            if (onRefresh) onRefresh(); // Refresh App.jsx data
        } catch (error) {
            console.error('Lỗi tạo lớp:', error);
            toast.error('Không thể tạo lớp học');
        }
    };

    // Xóa lớp
    const handleDeleteClass = async (id, className) => {
        if (!confirm(`Bạn có chắc muốn xóa lớp "${className}"? Tất cả dữ liệu liên quan sẽ bị mất.`)) return;
        try {
            await classAPI.delete(id);
            toast.success('Đã xóa lớp thành công');
            fetchClasses();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Lỗi xóa lớp:', error);
            toast.error('Không thể xóa lớp học');
        }
    };

    // Lọc tìm kiếm
    const filtered = classes.filter(c =>
        c.class_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.teacher_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.branch_name?.toLowerCase().includes(search.toLowerCase())
    );

    // Tính toán summary cards
    const totalClasses = classes.length;
    const activeClasses = classes.filter(c => c.status === 'active').length;
    const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', gap: '8px', color: 'var(--text-muted)' }}>
                <Loader size={20} className="spin" /> Đang tải dữ liệu lớp học...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Summary cards - Dữ liệu thật từ DB */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '10px', background: '#d1fae5', borderRadius: '8px' }}>
                        <BookOpen size={20} color="#1C513E" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalClasses}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tổng lớp học</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '8px' }}>
                        <BookOpen size={20} color="#1e40af" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeClasses}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đang hoạt động</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '8px' }}>
                        <Users size={20} color="#92400e" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalStudents}</div>
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
                <button className="btn btn-primary" style={{ gap: '6px', whiteSpace: 'nowrap' }} onClick={openCreateModal}>
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
                            <th>CHI NHÁNH</th>
                            <th>HỌC VIÊN</th>
                            <th>TRẠNG THÁI</th>
                            <th style={{ width: 80 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(cls => (
                            <tr key={cls.id}>
                                <td>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cls.class_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {cls.id}</div>
                                </td>
                                <td style={{ fontSize: '0.875rem' }}>{cls.teacher_name}</td>
                                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{cls.branch_name}</td>
                                <td>
                                    <div style={{ fontSize: '0.875rem' }}>{cls.student_count || 0}/{cls.max_students || 25}</div>
                                    <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, marginTop: 4, width: 80 }}>
                                        <div style={{ height: '100%', background: '#1C513E', borderRadius: 2, width: `${((cls.student_count || 0) / (cls.max_students || 25)) * 100}%` }} />
                                    </div>
                                </td>
                                <td><StatusBadge status={cls.status || 'active'} /></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleDeleteClass(cls.id, cls.class_name)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                            title="Xóa lớp"
                                        >
                                            <Trash2 size={16} />
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
                        Đang hiển thị {filtered.length} / {classes.length} lớp học
                    </span>
                </div>
            </div>

            {/* Modal tạo lớp mới */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '480px', maxWidth: '90vw', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Tạo lớp học mới</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Tên lớp *</label>
                                <input
                                    className="input"
                                    placeholder="VD: IELTS Intensive 7.0"
                                    value={formData.class_name}
                                    onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Giáo viên *</label>
                                <select
                                    className="input"
                                    value={formData.teacher_id}
                                    onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Chọn giáo viên --</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.full_name} ({t.specialized_subject})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Chi nhánh *</label>
                                <select
                                    className="input"
                                    value={formData.branch_id}
                                    onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                                    required
                                >
                                    <option value="">-- Chọn chi nhánh --</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.branch_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Trạng thái</label>
                                    <select
                                        className="input"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Đang mở</option>
                                        <option value="upcoming">Sắp khai giảng</option>
                                        <option value="closed">Đã đóng</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.875rem' }}>Sĩ số tối đa</label>
                                    <input
                                        className="input"
                                        type="number"
                                        min="1"
                                        value={formData.max_students}
                                        onChange={e => setFormData({ ...formData, max_students: parseInt(e.target.value) || 25 })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button type="button" className="btn" onClick={() => setShowModal(false)}
                                    style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--text-main)' }}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Plus size={16} /> Tạo lớp
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminClasses;
