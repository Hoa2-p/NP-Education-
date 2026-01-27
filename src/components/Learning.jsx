import React, { useState, useEffect } from 'react';
import { Book, Video, FileText, Download } from 'lucide-react';
import { materialAPI } from '../api';

const Learning = () => {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            const res = await materialAPI.getAll();
            setMaterials(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={24} color="#ef4444" />;
            case 'pdf': return <FileText size={24} color="#f97316" />;
            case 'audio': return <Download size={24} color="#3b82f6" />;
            default: return <Book size={24} color="#10b981" />;
        }
    };

    return (
        <div style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <div>
                    <h1>Tài liệu học tập</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Kho tài liệu cho học viên.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
                {materials.length > 0 ? materials.map(item => (
                    <div key={item.id} className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                            <div style={{ padding: 'var(--space-md)', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                                {getIcon(item.type)}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                fontWeight: '500'
                            }}>
                                {item.level}
                            </span>
                        </div>
                        <div style={{ marginTop: 'var(--space-md)' }}>
                            <h3 style={{ marginBottom: 'var(--space-xs)' }}>{item.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {item.type.toUpperCase()} • {item.link ? 'Liên kết ngoài' : 'File'}
                            </p>
                        </div>
                        <button className="btn" style={{ width: '100%', marginTop: 'var(--space-md)', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                            Xem tài liệu
                        </button>
                    </div>
                )) : <p>Chưa có tài liệu nào.</p>}
            </div>
        </div>
    );
};

export default Learning;
