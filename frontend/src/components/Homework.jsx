import React, { useState, useEffect } from 'react';
import { homeworkAPI } from '../api';
import { FileText, Clock, CheckCircle, AlertTriangle, Upload, Calendar } from 'lucide-react';

const Homework = ({ authUser, classes }) => {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [homeworkList, setHomeworkList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [submittingId, setSubmittingId] = useState(null);

    const isStudent = authUser?.role === 'Student';

    useEffect(() => {
        if (selectedClassId) {
            fetchHomework();
        } else {
            setHomeworkList([]);
        }
    }, [selectedClassId]);

    const fetchHomework = async () => {
        setLoading(true);
        try {
            const res = await homeworkAPI.getByClass(selectedClassId);
            setHomeworkList(res.data.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy bài tập:', error);
            setHomeworkList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitHomework = async (homeworkId, file) => {
        if (!file) return alert('Vui lòng chọn file!');
        setSubmittingId(homeworkId);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await homeworkAPI.submit(homeworkId, formData);
            alert(res.data.message || 'Nộp bài thành công!');
            fetchHomework();
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi nộp bài');
        } finally {
            setSubmittingId(null);
        }
    };

    // Filter logic
    const counts = {
        all: homeworkList.length,
        pending: homeworkList.filter(h => h.status === 'Chưa nộp').length,
        submitted: homeworkList.filter(h => h.status === 'Đã nộp').length,
        overdue: homeworkList.filter(h => h.status === 'Quá hạn').length,
    };

    const filtered = filter === 'all'
        ? homeworkList
        : homeworkList.filter(h => {
            if (filter === 'pending') return h.status === 'Chưa nộp';
            if (filter === 'submitted') return h.status === 'Đã nộp';
            if (filter === 'overdue') return h.status === 'Quá hạn';
            return true;
        });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getDaysRemaining = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (diff < 0) return `Quá hạn ${Math.abs(diff)} ngày`;
        if (diff === 0) return 'Hôm nay';
        if (diff === 1) return 'Còn 1 ngày';
        return `Còn ${diff} ngày`;
    };

    const filterTabs = [
        { key: 'all', label: 'Tất cả', count: counts.all },
        { key: 'pending', label: 'Chưa nộp', count: counts.pending },
        { key: 'submitted', label: 'Đã nộp', count: counts.submitted },
        { key: 'overdue', label: 'Quá hạn', count: counts.overdue },
    ];

    return (
        <div className="content-grid">
            {/* Chọn lớp */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header">
                    <h3>📝 Danh sách bài tập</h3>
                </div>
                <div className="card-body">
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Chọn lớp học:</label>
                        <select
                            className="input"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            style={{ maxWidth: '400px' }}
                        >
                            <option value="">-- Chọn lớp --</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.class_name} {cls.class_code ? `(${cls.class_code})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter tabs */}
                    {selectedClassId && homeworkList.length > 0 && (
                        <div className="homework-filter-tabs">
                            {filterTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    className={`homework-filter-btn ${filter === tab.key ? 'active' : ''}`}
                                    onClick={() => setFilter(tab.key)}
                                >
                                    {tab.label}
                                    <span className="homework-filter-count">{tab.count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách bài tập...</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && selectedClassId && filtered.length === 0 && (
                <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                    <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>
                        {homeworkList.length === 0
                            ? 'Lớp này chưa có bài tập nào.'
                            : 'Không có bài tập phù hợp với bộ lọc.'}
                    </p>
                </div>
            )}

            {/* Danh sách bài tập */}
            {!loading && filtered.map(hw => {
                const isOverdue = hw.status === 'Quá hạn';
                const isSubmitted = hw.status === 'Đã nộp';
                const isPending = hw.status === 'Chưa nộp';

                return (
                    <div key={hw.id} className={`card homework-card ${isOverdue ? 'homework-overdue' : ''}`} style={{ gridColumn: '1 / -1' }}>
                        <div className="card-body">
                            {/* Header */}
                            <div className="homework-card-header">
                                <div className="homework-card-info">
                                    <div className="homework-icon-wrapper">
                                        {isOverdue ? <AlertTriangle size={24} color="#dc2626" /> :
                                         isSubmitted ? <CheckCircle size={24} color="#059669" /> :
                                         <FileText size={24} color="var(--primary)" />}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 600 }}>{hw.title}</h4>
                                        <div className="homework-meta">
                                            <span><Calendar size={14} /> Hạn nộp: {formatDate(hw.due_date)}</span>
                                            <span className="homework-days-remaining">{getDaysRemaining(hw.due_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span className={`homework-badge ${
                                        isSubmitted ? 'homework-badge-submitted' :
                                        isOverdue ? 'homework-badge-overdue' :
                                        'homework-badge-pending'
                                    }`}>
                                        {isSubmitted ? '✓' : isOverdue ? '!' : '○'} {hw.status}
                                    </span>
                                    {hw.submission_label && (
                                        <span className={`homework-label ${
                                            hw.submission_label === 'Đúng hạn' ? 'homework-label-ontime' : 'homework-label-late'
                                        }`}>
                                            {hw.submission_label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Submission info */}
                            {isSubmitted && hw.submitted_at && (
                                <div className="homework-submission-info">
                                    <span>📅 Nộp lúc: {formatDateTime(hw.submitted_at)}</span>
                                    {hw.score !== null && hw.score !== undefined && (
                                        <span>⭐ Điểm: {hw.score}</span>
                                    )}
                                </div>
                            )}

                            {/* Submit form (Student only) */}
                            {isStudent && (
                                <div className="homework-submit-form">
                                    <div className="homework-submit-row">
                                        <input
                                            type="file"
                                            className="input"
                                            id={`file-${hw.id}`}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                                        />
                                        <button
                                            className="btn btn-primary"
                                            disabled={submittingId === hw.id}
                                            onClick={() => {
                                                const fileInput = document.getElementById(`file-${hw.id}`);
                                                handleSubmitHomework(hw.id, fileInput?.files[0]);
                                            }}
                                        >
                                            <Upload size={16} />
                                            {submittingId === hw.id
                                                ? 'Đang nộp...'
                                                : isSubmitted
                                                    ? 'Nộp lại'
                                                    : 'Nộp bài'}
                                        </button>
                                    </div>
                                    {isOverdue && !isSubmitted && (
                                        <p className="homework-overdue-warning">
                                            ⚠️ Bài tập đã quá hạn. Nộp bài sẽ được đánh dấu "Nộp muộn".
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Homework;
