import React, { useState, useEffect, useRef } from 'react';
import { homeworkAPI } from '../api';
import { FileText, Search, Upload, UploadCloud, File, FileIcon, Video, CheckCircle, AlertTriangle } from 'lucide-react';
import './Homework.css';

const Homework = ({ authUser, classes }) => {
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [homeworkList, setHomeworkList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('name-asc');
    
    // View state: 'list' | 'create' | 'detail'
    const [view, setView] = useState('list');
    const [selectedHomework, setSelectedHomework] = useState(null);
    const [submittingId, setSubmittingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // all, chua-nop, da-nop, qua-han
    
    // Form state for creating homework
    const [newHomework, setNewHomework] = useState({
        classId: '',
        title: '',
        description: '',
        start_date: '',
        due_date: '', // used for datetime-local
        file: null
    });

    const [formErrors, setFormErrors] = useState({});

    const fileInputRef = useRef(null);

    const isStudent = authUser?.role === 'Student';
    const isTeacher = authUser?.role === 'Teacher';

    // In list view, if selectedClassId is 'all', we might not show anything because API needs a specific classId
    // For now we assume if 'all', we either ask them to pick a class or we fetch all if possible.
    // The current backend only supports `getByClass(classId)`.
    useEffect(() => {
        if (selectedClassId) {
            fetchHomework(selectedClassId);
        } else if (classes.length > 0) {
            setSelectedClassId('all');
        } else {
            setHomeworkList([]);
        }
    }, [selectedClassId, classes]);

    const fetchHomework = async (classId) => {
        setLoading(true);
        try {
            const res = classId === 'all'
                ? await homeworkAPI.getAll()
                : await homeworkAPI.getByClass(classId);
            setHomeworkList(res.data.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy bài tập:', error);
            setHomeworkList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateHomework = async (e) => {
        e.preventDefault();
        
        const errors = {};
        const { classId, title, description, start_date, due_date, file } = newHomework;
        
        if (!classId) errors.classId = "Vui lòng chọn môn học/lớp học.";
        if (!title.trim()) errors.title = "Vui lòng nhập tên bài tập.";
        else if (title.length > 200) errors.title = "Tên bài tập không được vượt quá 200 ký tự.";
        
        if (!description.trim()) errors.description = "Vui lòng nhập mô tả bài tập.";
        else if (description.length > 200) errors.description = "Mô tả không được vượt quá 200 ký tự.";
        
        if (!start_date) errors.start_date = "Vui lòng chọn ngày bắt đầu.";
        if (!due_date) errors.due_date = "Vui lòng chọn hạn nộp.";
        
        if (due_date) {
            const dueDatetime = new Date(due_date);
            if (dueDatetime <= new Date()) {
                errors.due_date = "Thời gian bắt đầu không hợp lệ."; // Error specified in requirement
            }
        }

        if (!file) {
            errors.file = "Vui lòng chọn tệp đính kèm.";
        } else if (file.size > 100 * 1024 * 1024) {
            errors.file = "Dung lượng tệp đính kèm vượt quá 100MB.";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('start_date', start_date);
            
            // split datetime-local into date and time
            const dueD = new Date(due_date);
            const dDate = dueD.toISOString().split('T')[0];
            const dTime = dueD.toTimeString().split(' ')[0];
            
            formData.append('due_date', dDate);
            formData.append('due_time', dTime);
            formData.append('file', file);

            const res = await homeworkAPI.create(classId, formData);
            alert(res.data.message || 'Tạo bài tập thành công.');
            
            setView('list');
            setNewHomework({ classId: '', title: '', description: '', start_date: '', due_date: '', file: null });
            setSelectedClassId(classId); // Switch list view to new specific class
            fetchHomework(classId);
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi tạo bài tập');
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setNewHomework({...newHomework, file: droppedFile});
            if (formErrors.file) setFormErrors({...formErrors, file: null});
        }
    };

    const formatDateCustom = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // Format: 20:00, 25/03/2026
        const time = d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
        const date = d.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'});
        return `${time}, ${date}`;
    };

    // Calculate statuses for students to use in filtering and UI
    const processedHomeworkList = homeworkList.map(hw => {
        const dueDate = new Date(hw.due_date);
        const isClosed = dueDate < new Date();
        
        let statusStr = "Chưa nộp";
        let statusClass = "chua-nop";
        let scoreStr = "--/10";
        let scoreColor = "#94a3b8"; // Gray for un-graded or un-submitted

        // Mock status logic if student (adjust if backend provides actual data)
        if (hw.is_submitted) {
            statusStr = "Đã nộp";
            statusClass = "da-nop";
            if (hw.score !== undefined && hw.score !== null) {
                scoreStr = `${hw.score}/10`;
                scoreColor = "#16a34a"; // Green when graded
            } else {
                // Submitted but not graded yet
                scoreStr = "--/10";
                scoreColor = "#94a3b8"; 
            }
        } else {
            if (isClosed) {
                statusStr = "Quá hạn";
                statusClass = "qua-han";
                scoreStr = "0/10";
                scoreColor = "#ef4444"; // Red
            } else {
                statusStr = "Chưa nộp";
                statusClass = "chua-nop";
                scoreStr = "--/10";
                scoreColor = "#94a3b8"; // Gray
            }
        }

        return { ...hw, isClosed, statusStr, statusClass, scoreStr, scoreColor };
    });

    let displayedList = processedHomeworkList.filter(hw => hw.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (isStudent && statusFilter !== 'all') {
        displayedList = displayedList.filter(hw => hw.statusClass === statusFilter);
    }
    
    if (sortOrder === 'name-asc') {
        displayedList.sort((a,b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'name-desc') {
        displayedList.sort((a,b) => b.title.localeCompare(a.title));
    }

    const renderListView = () => (
        <div className="hw-container">
            <div className="hw-page-header">
                <div>
                    <h2 className="hw-page-title">Quản lý bài tập</h2>
                    <p className="hw-page-desc">Theo dõi tiến độ nộp bài và chấm điểm cho các lớp học.</p>
                </div>
            </div>

            <div className="hw-filters-card">
                <div className="hw-filter-group" style={{maxWidth: '250px'}}>
                    <label className="hw-filter-label">Lọc theo lớp</label>
                    <select 
                        className="hw-input"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="all">Tất cả lớp học</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>
                                {cls.class_name}
                            </option>
                        ))}
                    </select>
                </div>
                {isStudent && (
                    <div className="hw-filter-group" style={{maxWidth: '200px'}}>
                        <label className="hw-filter-label">Trạng thái nộp bài</label>
                        <select 
                            className="hw-input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="chua-nop">Chưa nộp</option>
                            <option value="da-nop">Đã nộp</option>
                            <option value="qua-han">Quá hạn</option>
                        </select>
                    </div>
                )}
                <div className="hw-filter-group">
                    <label className="hw-filter-label">Tìm kiếm bài tập</label>
                    <div style={{position: 'relative'}}>
                        <Search size={16} color="#9ca3af" style={{position: 'absolute', left: '12px', top: '12px'}} />
                        <input 
                            type="text" 
                            className="hw-input" 
                            placeholder="Nhập tên bài tập..." 
                            style={{paddingLeft: '38px'}}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="hw-toolbar">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span style={{fontSize: '0.85rem', color: '#6b7280'}}>Sắp xếp theo:</span>
                    <select className="hw-input" style={{padding: '8px', minWidth: '130px'}} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                        <option value="name-asc">Tên (A-Z)</option>
                        <option value="name-desc">Tên (Z-A)</option>
                    </select>
                </div>
                {isTeacher && (
                    <button className="hw-btn-submit" onClick={() => setView('create')}>
                        <Upload size={16} /> Tải lên bài tập
                    </button>
                )}
            </div>

            <table className="hw-table">
                <thead>
                    <tr>
                        <th>Tên bài tập</th>
                        <th>Thời hạn</th>
                        <th>Trạng thái</th>
                        <th>Tình trạng nộp</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>Đang tải...</td></tr>
                    )}
                    {!loading && displayedList.length === 0 && (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>Không có bài tập nào.</td></tr>
                    )}
                    {!loading && displayedList.map(hw => {
                        return (
                            <tr key={hw.id}>
                                <td>
                                    <div className="hw-item-title-col">
                                        <div className={`hw-item-icon ${hw.isClosed ? 'closed' : 'active'}`}>
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <div className="hw-item-name">
                                                {hw.title}
                                                {hw.class_name && (
                                                    <span className="hw-item-class-badge">
                                                        {hw.class_name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="hw-item-desc">{hw.description || 'Bài tập rèn luyện'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="hw-item-datetime">{formatDateCustom(hw.due_date)}</div>
                                </td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                    {isStudent ? (
                                        <span className={`hw-status-badge ${hw.statusClass}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                                            {hw.statusStr}
                                        </span>
                                    ) : (
                                        <span className={`hw-status-badge ${hw.isClosed ? 'closed' : 'active'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                                            {hw.isClosed ? 'Closed' : 'Active'}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {isStudent ? (
                                        <div className="hw-progress" style={{ color: hw.scoreColor, fontWeight: 600 }}>
                                            {hw.scoreStr}
                                        </div>
                                    ) : (
                                        <div className="hw-progress">
                                            0/0
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {isTeacher ? (
                                        <button className={`hw-btn-action ${hw.isClosed ? 'light' : ''}`}>
                                            {hw.isClosed ? 'Xem điểm' : 'Chấm điểm'}
                                        </button>
                                    ) : (
                                        <button className="hw-btn-action" onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedHomework(hw);
                                            setView('detail');
                                        }}>
                                            Xem chi tiết
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const renderCreateView = () => (
        <div className="hw-container">
            <div className="hw-page-header">
                <div>
                    <h2 className="hw-page-title">Tải lên bài tập</h2>
                </div>
            </div>

            <div className="hw-upload-card">
                <form onSubmit={handleCreateHomework} noValidate>
                    <div className="hw-form-group">
                        <label className="hw-form-label">Chọn môn học</label>
                        <select 
                            className={`hw-input ${formErrors.classId ? 'error' : ''}`}
                            value={newHomework.classId}
                            onChange={(e) => {
                                setNewHomework({...newHomework, classId: e.target.value});
                                if (formErrors.classId) setFormErrors({...formErrors, classId: null});
                            }}
                        >
                            <option value="">Chọn môn học từ danh sách...</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                            ))}
                        </select>
                        {formErrors.classId && <span className="hw-error-text">{formErrors.classId}</span>}
                    </div>

                    <div className="hw-form-group">
                        <label className="hw-form-label">Tên bài tập</label>
                        <input 
                            type="text" 
                            placeholder="Ví dụ: Bài tập Reading Unit 5 - Advanced"
                            className={`hw-input ${formErrors.title ? 'error' : ''}`}
                            value={newHomework.title}
                            onChange={(e) => {
                                setNewHomework({...newHomework, title: e.target.value});
                                if (formErrors.title) setFormErrors({...formErrors, title: null});
                            }}
                        />
                        {formErrors.title && <span className="hw-error-text">{formErrors.title}</span>}
                    </div>

                    <div className="hw-form-group">
                        <label className="hw-form-label">Mô tả</label>
                        <textarea 
                            placeholder="Nhập tóm tắt nội dung bài tập hoặc lưu ý cho học viên..."
                            className={`hw-input hw-textarea ${formErrors.description ? 'error' : ''}`}
                            value={newHomework.description}
                            onChange={(e) => {
                                setNewHomework({...newHomework, description: e.target.value});
                                if (formErrors.description) setFormErrors({...formErrors, description: null});
                            }}
                        />
                        {formErrors.description && <span className="hw-error-text">{formErrors.description}</span>}
                    </div>

                    <div className="hw-date-row hw-form-group">
                        <div>
                            <label className="hw-form-label">Ngày bắt đầu</label>
                            <input 
                                type="date" 
                                className={`hw-input ${formErrors.start_date ? 'error' : ''}`}
                                value={newHomework.start_date}
                                onChange={(e) => {
                                    setNewHomework({...newHomework, start_date: e.target.value});
                                    if (formErrors.start_date) setFormErrors({...formErrors, start_date: null});
                                }}
                            />
                            {formErrors.start_date && <span className="hw-error-text">{formErrors.start_date}</span>}
                        </div>
                        <div>
                            <label className="hw-form-label">Hạn nộp</label>
                            <input 
                                type="datetime-local" 
                                className={`hw-input ${formErrors.due_date ? 'error' : ''}`}
                                value={newHomework.due_date}
                                onChange={(e) => {
                                    setNewHomework({...newHomework, due_date: e.target.value});
                                    if (formErrors.due_date) setFormErrors({...formErrors, due_date: null});
                                }}
                            />
                            {formErrors.due_date && <span className="hw-error-text">{formErrors.due_date}</span>}
                        </div>
                    </div>

                    <div className="hw-form-group">
                        <label className="hw-form-label">Tệp đính kèm</label>
                        <div 
                            className={`hw-dropzone ${formErrors.file ? 'error' : ''}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{display: 'none'}} 
                                onChange={(e) => {
                                    if (e.target.files[0]) {
                                        setNewHomework({...newHomework, file: e.target.files[0]});
                                        if (formErrors.file) setFormErrors({...formErrors, file: null});
                                    }
                                }}
                            />
                            
                            {newHomework.file ? (
                                <div>
                                    <CheckCircle size={40} color="#10B981" style={{margin: '0 auto 10px auto', display: 'block'}} />
                                    <div className="hw-dropzone-title">Đã chọn tệp: {newHomework.file.name}</div>
                                    <div className="hw-dropzone-subtitle">Click hoặc kéo thả để chọn tệp khác</div>
                                </div>
                            ) : (
                                <div>
                                    <div className="hw-dropzone-icon">
                                        <UploadCloud size={24} />
                                    </div>
                                    <div className="hw-dropzone-title">Kéo thả tệp vào đây</div>
                                    <div className="hw-dropzone-subtitle">hoặc click để chọn tệp</div>
                                    
                                    <div className="hw-file-types">
                                        <span className="hw-file-type"><FileIcon size={20} color="#ef4444"/> PDF</span>
                                        <span className="hw-file-type"><FileText size={20} color="#3b82f6"/> WORD</span>
                                        <span className="hw-file-type"><File size={20} color="#f97316"/> PPT</span>
                                        <span className="hw-file-type"><Video size={20} color="#8b5cf6"/> VIDEO</span>
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="hw-dropzone-footer">
                            <AlertTriangle size={14} style={{marginRight: '6px'}} /> Giới hạn dung lượng: 100MB
                        </div>
                        {formErrors.file && <span className="hw-error-text">{formErrors.file}</span>}
                    </div>

                    <div className="hw-form-actions">
                        <button type="button" className="hw-btn-cancel" onClick={() => setView('list')}>Hủy</button>
                        <button type="submit" className="hw-btn-submit">
                            Tải lên <Upload size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderDetailView = () => {
        if (!selectedHomework) return null;
        
        const isClosed = selectedHomework.isClosed;
        // MOCK for demonstration based on user request states. 
        // In real app, this relates to `selectedHomework.is_submitted`
        const isSubmitted = selectedHomework.is_submitted || false; 
        
        // Mocking some files for display if not present
        const mockOriginalFiles = [
            { name: selectedHomework.file_url ? selectedHomework.file_url.split('/').pop() : 'Topic_Task.pdf', size: '1.2 MB', type: 'pdf' },
            { name: 'Topic_Infographic.jpg', size: '856 KB', type: 'image' }
        ];

        const mockSubmittedFiles = isSubmitted ? [
            { name: 'Reading_Analysis_Final.pdf', size: '2.4 MB', time: '14:15', type: 'pdf' },
            { name: 'Vocabulary_Mindmap.jpg', size: '1.1 MB', time: '14:18', type: 'image' }
        ] : [];

        // Left column
        const renderLeftColumn = () => (
            <div className="hw-detail-left">
                <div className="hw-detail-main-header">
                    <span className={`hw-status-badge ${selectedHomework.statusClass}`} style={{marginBottom: '10px'}}>
                        {selectedHomework.statusStr}
                    </span>
                    <h2 className="hw-detail-title-large">{selectedHomework.title}</h2>
                    <div className="hw-detail-time">
                        <AlertTriangle size={14} /> Thời gian nộp: {formatDateCustom(selectedHomework.due_date)}
                    </div>
                </div>

                <div className="hw-detail-section">
                    <h3 className="hw-section-title">Yêu cầu bài tập</h3>
                    <div className="hw-detail-desc">
                        {selectedHomework.description || "Discuss both these views and give your own opinion.\n\nWrite at least 250 words.\nUse specific reasons and examples to support your position."}
                    </div>
                </div>

                <div className="hw-detail-section">
                    <h3 className="hw-section-title">
                        {isSubmitted ? 'Danh sách file bài làm' : 'Tài liệu đính kèm'}
                    </h3>
                    
                    {(isSubmitted ? mockSubmittedFiles : mockOriginalFiles).map((file, idx) => (
                        <div key={idx} className="hw-file-item">
                            <div className={`hw-file-icon ${file.type === 'image' ? 'image' : ''}`}>
                                {file.type === 'image' ? <FileIcon size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="hw-file-info">
                                <div className="hw-file-name">{file.name}</div>
                                <div className="hw-file-meta">
                                    {file.size} {file.time && `• Tải lên lúc ${file.time}`}
                                </div>
                            </div>
                            <div className="hw-file-download">
                                <UploadCloud size={18} style={{transform: 'rotate(180deg)'}} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        // Right column
        const renderRightColumn = () => {
            if (!isSubmitted) {
                // State 1: Chưa nộp
                return (
                    <div className="hw-detail-right">
                        <div className="hw-submit-card">
                            <h3 className="hw-submit-card-title">Nộp bài làm</h3>
                            <div className="hw-upload-zone">
                                <UploadCloud size={32} color="#9ca3af" style={{margin: '0 auto 10px'}} />
                                <div style={{fontWeight: 600, color: '#1f2937'}}>Kéo thả file vào đây</div>
                                <div style={{fontSize: '0.8rem', color: '#9ca3af'}}>hoặc click để chọn file từ máy tính</div>
                            </div>
                            <button className="hw-btn-submit-large">
                                <Upload size={18} /> Nộp bài ngay
                            </button>
                            <button className="hw-btn-cancel" onClick={() => setView('list')} style={{width: '100%', textAlign: 'center'}}>Hủy</button>
                            <div className="hw-submit-note">
                                <AlertTriangle size={14} color="#f59e0b" style={{flexShrink: 0}} /> Lưu ý: Bạn chỉ có thể nộp bài trước thời hạn.
                            </div>
                        </div>

                        <div className="hw-feedback-card">
                            <div className="hw-feedback-icon">
                                <FileText size={20} />
                            </div>
                            <div className="hw-feedback-title">Chưa có nhận xét</div>
                            <div className="hw-feedback-desc">Nhận xét từ giáo viên sẽ hiển thị ở đây sau khi bài làm được chấm.</div>
                        </div>
                    </div>
                );
            }

            if (isSubmitted && isClosed) {
                // State 2: Đã nộp, hết hạn
                return (
                    <div className="hw-detail-right">
                        <div className="hw-score-card">
                            <div className="hw-score-label">ĐIỂM SỐ ĐẠT ĐƯỢC</div>
                            <div className="hw-score-value">
                                {selectedHomework.score !== undefined ? selectedHomework.score : '8.5'}
                                <span className="hw-score-total">/10</span>
                            </div>
                        </div>
                        
                        <button className="hw-btn-secondary" onClick={() => setView('list')}>
                            &larr; Quay lại danh sách
                        </button>

                        <div className="hw-feedback-card" style={{textAlign: 'left', background: '#fff'}}>
                            <div className="hw-section-title" style={{marginBottom: '15px'}}><FileText size={18} color="#16a34a"/> Phản hồi của giáo viên</div>
                            <div className="hw-feedback-content">
                                {selectedHomework.feedback || 'Bài làm rất tốt, tuy nhiên, cần chú ý hơn về cấu trúc câu ở phần tóm tắt để bài viết mạch lạc hơn nhé. Cố gắng phát huy!'}
                            </div>
                        </div>
                    </div>
                );
            }

            if (isSubmitted && !isClosed) {
                // State 3: Đã nộp, chưa hết hạn (có thể sửa)
                return (
                    <div className="hw-detail-right">
                        <div className="hw-score-card">
                            <div className="hw-score-label">ĐIỂM SỐ ĐẠT ĐƯỢC</div>
                            <div className="hw-score-value">
                                --<span className="hw-score-total">/10</span>
                            </div>
                        </div>
                        
                        <button className="hw-btn-edit">
                            <FileText size={18} /> Sửa bài làm
                        </button>
                        <button className="hw-btn-secondary" onClick={() => setView('list')}>
                            &larr; Quay lại danh sách
                        </button>

                        <div className="hw-feedback-card">
                            <div className="hw-feedback-icon">
                                <FileText size={20} />
                            </div>
                            <div className="hw-feedback-title">Chưa có nhận xét</div>
                            <div className="hw-feedback-desc">Nhận xét từ giáo viên sẽ hiển thị ở đây sau khi bài làm được chấm.</div>
                        </div>
                    </div>
                );
            }
        };

        return (
            <div className="hw-container">
                <div className="hw-breadcrumb">
                    <span 
                        onClick={() => setView('list')}
                        style={{ cursor: 'pointer', color: '#6b7280', fontWeight: 'normal' }}
                        onMouseOver={(e) => e.target.style.color = '#1C513E'}
                        onMouseOut={(e) => e.target.style.color = '#6b7280'}
                    >
                        Bài tập
                    </span> &rsaquo; <span>{isSubmitted ? 'Xem lại' : 'Xem chi tiết'}</span>
                </div>
                <div className="hw-detail-layout">
                    {renderLeftColumn()}
                    {renderRightColumn()}
                </div>
            </div>
        );
    };

    if (view === 'create') return renderCreateView();
    if (view === 'detail') return renderDetailView();
    return renderListView();
};

export default Homework;
