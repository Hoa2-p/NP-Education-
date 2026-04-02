import React, { useEffect, useState } from 'react';
import {
    BookOpen,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    FileType2,
    Image,
    Presentation,
    RefreshCw,
    Upload,
    Video
} from 'lucide-react';
import { materialAPI } from '../api';
import { toast } from 'react-toastify';

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.mov,.avi';

const getMaterialPresentation = (material) => {
    switch (material.file_type) {
        case 'pdf':
            return { icon: <FileText size={22} color="#dc2626" />, label: 'PDF' };
        case 'word':
            return { icon: <FileType2 size={22} color="#2563eb" />, label: 'Word' };
        case 'presentation':
            return { icon: <Presentation size={22} color="#f97316" />, label: 'PowerPoint' };
        case 'spreadsheet':
            return { icon: <FileSpreadsheet size={22} color="#16a34a" />, label: 'Bảng tính' };
        case 'image':
            return { icon: <Image size={22} color="#9333ea" />, label: 'Hình ảnh' };
        case 'video':
            return { icon: <Video size={22} color="#e11d48" />, label: 'Video' };
        default:
            return { icon: <BookOpen size={22} color="#0f766e" />, label: 'Tài liệu' };
    }
};

const formatDateTime = (value) => {
    if (!value) return '--';

    return new Date(value).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getUploadErrorMessage = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (typeof error.response?.data === 'string' && error.response.data.trim()) {
        if (error.response.data.includes('Cannot POST')) {
            return 'Frontend đang dùng bản cũ hoặc backend chưa reload route upload. Hãy tải lại trang bằng Ctrl+F5 và khởi động lại server backend.';
        }

        return error.response.data;
    }

    if (error.message) {
        return `Lỗi kết nối hoặc gửi dữ liệu: ${error.message}`;
    }

    return 'Không thể tải tài liệu lên.';
};

const Learning = ({ authUser, classes = [] }) => {
    const [materials, setMaterials] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        file: null,
    });

    const token = localStorage.getItem('token') || '';
    const canUpload = ['Admin', 'Teacher'].includes(authUser?.role);

    useEffect(() => {
        if (!classes.length) {
            setSelectedClassId('');
            setMaterials([]);
            return;
        }

        const hasSelectedClass = classes.some((item) => String(item.id) === String(selectedClassId));
        if (!hasSelectedClass) {
            setSelectedClassId(String(classes[0].id));
        }
    }, [classes, selectedClassId]);

    useEffect(() => {
        if (selectedClassId) {
            loadMaterials(selectedClassId);
        }
    }, [selectedClassId]);

    const loadMaterials = async (classId) => {
        setLoading(true);

        try {
            const response = await materialAPI.getByClass(classId);
            setMaterials(response.data.data || []);
        } catch (error) {
            console.error(error);
            setMaterials([]);

            if (error.response?.status === 403) {
                toast.error('Bạn không có quyền xem tài liệu của lớp này.');
            } else if (error.response?.status === 404) {
                toast.error('Không tìm thấy lớp học.');
            } else {
                toast.error('Không thể tải danh sách tài liệu.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMaterial = (material, mode) => {
        if (!token) {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return;
        }

        // Nếu là tải xuống, luôn dùng endpoint download
        if (mode === 'download') {
            const url = materialAPI.getDownloadUrl(material.id, token);
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
        }

        // Nếu xem file Office (pptx, docx, xlsx), dùng Google Docs Viewer
        const officeTypes = ['presentation', 'word', 'spreadsheet'];
        if (officeTypes.includes(material.file_type)) {
            const fileUrl = materialAPI.getDownloadUrl(material.id, token);
            const fullUrl = window.location.origin.replace(/:\d+$/, ':5000') + '/api/materials/' + material.id + '/download?token=' + encodeURIComponent(token);
            const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;
            window.open(googleViewerUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        // Mặc định: mở xem trực tiếp (PDF, ảnh, video...)
        const url = materialAPI.getViewUrl(material.id, token);
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!selectedClassId) {
            toast.error('Vui lòng chọn lớp học trước khi tải tài liệu.');
            return;
        }

        if (!uploadForm.file) {
            toast.error('Vui lòng chọn file tài liệu.');
            return;
        }

        if (uploadForm.file.size > MAX_UPLOAD_SIZE_BYTES) {
            toast.error('File vượt quá 10MB. Vui lòng chọn file nhỏ hơn.');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('class_id', selectedClassId);
            formData.append('title', uploadForm.title.trim() || uploadForm.file.name);
            formData.append('file', uploadForm.file);

            await materialAPI.upload(formData);
            toast.success('Tải tài liệu lên thành công.');
            setUploadForm({ title: '', file: null });

            const fileInput = document.getElementById('material-upload-input');
            if (fileInput) {
                fileInput.value = '';
            }

            await loadMaterials(selectedClassId);
        } catch (error) {
            console.error('Upload material failed:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            toast.error(getUploadErrorMessage(error));
        } finally {
            setUploading(false);
        }
    };

    if (!classes.length) {
        return (
            <div style={{ padding: 'var(--space-lg)' }}>
                <h1>Tài liệu học tập</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Bạn chưa có lớp học nào để xem tài liệu.
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: 'var(--space-lg)', display: 'grid', gap: 'var(--space-lg)' }}>
            <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: 'var(--space-xs)' }}>Tài liệu học tập</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        Danh sách tài liệu được lấy trực tiếp từ database theo từng lớp học.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        className="input"
                        value={selectedClassId}
                        onChange={(event) => setSelectedClassId(event.target.value)}
                        style={{ minWidth: '220px' }}
                    >
                        {classes.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.class_name}
                            </option>
                        ))}
                    </select>

                    <button
                        className="btn"
                        type="button"
                        onClick={() => loadMaterials(selectedClassId)}
                        disabled={!selectedClassId || loading}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCw size={16} />
                        Làm mới
                    </button>
                </div>
            </div>

            {canUpload && (
                <form className="card" onSubmit={handleUpload} style={{ display: 'grid', gap: 'var(--space-md)' }}>
                    <div>
                        <h3 style={{ marginBottom: 'var(--space-xs)' }}>Tải tài liệu lên</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                            Admin và Giáo viên có thể thêm tài liệu trực tiếp cho lớp đang chọn.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
                        <input
                            className="input"
                            type="text"
                            placeholder="Tên tài liệu"
                            value={uploadForm.title}
                            onChange={(event) => setUploadForm((prev) => ({ ...prev, title: event.target.value }))}
                        />

                        <input
                            id="material-upload-input"
                            className="input"
                            type="file"
                            accept={ACCEPTED_FILE_TYPES}
                            onChange={(event) => setUploadForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn"
                            type="submit"
                            disabled={uploading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Upload size={16} />
                            {uploading ? 'Đang tải lên...' : 'Tải tài liệu'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="card">
                    <p style={{ margin: 0 }}>Đang tải tài liệu...</p>
                </div>
            ) : materials.length === 0 ? (
                <div className="card">
                    <p style={{ margin: 0 }}>Lớp học này chưa có tài liệu nào.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
                    {materials.map((item) => {
                        const presentation = getMaterialPresentation(item);

                        return (
                            <article key={item.id} className="card" style={{ display: 'grid', gap: 'var(--space-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ padding: '12px', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                                            {presentation.icon}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{item.title}</h3>
                                            <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {presentation.label}
                                            </p>
                                        </div>
                                    </div>

                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        background: item.is_external ? '#fef3c7' : '#dcfce7',
                                        color: item.is_external ? '#b45309' : '#166534',
                                        fontWeight: '600'
                                    }}>
                                        {item.is_external ? 'Link ngoài' : 'File nội bộ'}
                                    </span>
                                </div>

                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                    <div>Ngày đăng: {formatDateTime(item.uploaded_at)}</div>
                                    <div>Đường dẫn lưu: {item.file_url}</div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => handleOpenMaterial(item, 'view')}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Eye size={16} />
                                        Xem
                                    </button>

                                    <button
                                        className="btn"
                                        type="button"
                                        onClick={() => handleOpenMaterial(item, 'download')}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Download size={16} />
                                        Tải xuống
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Learning;
