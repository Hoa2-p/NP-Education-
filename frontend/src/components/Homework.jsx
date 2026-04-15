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
    
    // View state: 'list' | 'create'
    const [view, setView] = useState('list');
    const [submittingId, setSubmittingId] = useState(null);
    
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

    // Filter and Sort Lists
    let displayedList = homeworkList.filter(hw => hw.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
                        const dueDate = new Date(hw.due_date);
                        const isClosed = dueDate < new Date();
                        
                        return (
                            <tr key={hw.id}>
                                <td>
                                    <div className="hw-item-title-col">
                                        <div className={`hw-item-icon ${isClosed ? 'closed' : 'active'}`}>
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
                                <td>
                                    <span className={`hw-status-badge ${isClosed ? 'closed' : 'active'}`}>
                                        {isClosed ? 'Closed' : 'Active'}
                                    </span>
                                </td>
                                <td>
                                    <div className="hw-progress">
                                        0/0 {/* Fallback strictly per request specs without modifying DB joins */}
                                    </div>
                                </td>
                                <td>
                                    {isTeacher ? (
                                        <button className={`hw-btn-action ${isClosed ? 'light' : ''}`}>
                                            {isClosed ? 'Xem điểm' : 'Chấm điểm'}
                                        </button>
                                    ) : (
                                        <button className="hw-btn-action">
                                            Nộp bài
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

    return view === 'create' ? renderCreateView() : renderListView();
};

export default Homework;
