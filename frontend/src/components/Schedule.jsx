import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { scheduleAPI } from '../api';
import { toast } from 'react-toastify';

// Bảng màu cố định theo tên lớp (dùng hash đơn giản)
const CLASS_COLORS = [
    '#10b981', '#3b82f6', '#8b5cf6', '#f97316',
    '#ef4444', '#14b8a6', '#ec4899', '#6366f1',
    '#f59e0b', '#06b6d4'
];

const getClassColor = (className) => {
    let hash = 0;
    for (let i = 0; i < (className || '').length; i++) {
        hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CLASS_COLORS[Math.abs(hash) % CLASS_COLORS.length];
};

const Schedule = ({ authUser, classes }) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [filterClass, setFilterClass] = useState('All');
    const [scheduleData, setScheduleData] = useState([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const res = await scheduleAPI.getAll();
                const formattedSchedules = res.data.data.map(item => ({
                    id: item.session_id,
                    date: new Date(item.session_date),
                    day: new Date(item.session_date).getDay(),
                    time: `${String(item.start_time).substring(0, 5)} - ${String(item.end_time).substring(0, 5)}`,
                    class: item.class_name,
                    room: item.room || 'Phòng học 1',
                    teacher: item.teacher_name
                }));
                setScheduleData(formattedSchedules);
            } catch (error) {
                console.error("Error fetching schedules:", error);
                toast.error("Không lấy được thời khóa biểu");
            }
        };

        if (authUser) {
            fetchSchedules();
        }
    }, [authUser]);

    const DAYS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    // Tính ngày đầu tuần (Thứ 2)
    const getMonday = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const monday = useMemo(() => getMonday(currentWeek), [currentWeek]);

    // Tạo mảng 7 ngày trong tuần
    const weekDates = useMemo(() => {
        return DAYS.map((_, i) => {
            // Sắp xếp: index 0 = CN, 1 = T2, ..., 6 = T7
            // Nhưng monday là Thứ 2 (day=1), cần map lại:
            const d = new Date(monday);
            if (i === 0) {
                d.setDate(monday.getDate() + 6); // Chủ Nhật cuối tuần
            } else {
                d.setDate(monday.getDate() + (i - 1));
            }
            return d;
        });
    }, [monday]);

    const formatDate = (d) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const weekLabel = `${formatDate(weekDates[1])} - ${formatDate(weekDates[0])}`;

    // Lật tuần
    const goToPrevWeek = () => {
        setCurrentWeek(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() - 7);
            return d;
        });
    };

    const goToNextWeek = () => {
        setCurrentWeek(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + 7);
            return d;
        });
    };

    const goToToday = () => setCurrentWeek(new Date());

    // Lọc theo khoảng ngày tuần hiện tại
    const filteredSchedule = useMemo(() => {
        const startOfWeek = weekDates[1]; // Thứ 2
        const endOfWeek = new Date(weekDates[0]); // Chủ Nhật
        endOfWeek.setHours(23, 59, 59, 999);

        let data = scheduleData.filter(item => {
            const d = new Date(item.date);
            d.setHours(0, 0, 0, 0);
            return d >= startOfWeek && d <= endOfWeek;
        });

        if (filterClass !== 'All') {
            data = data.filter(item => item.class === filterClass);
        }
        return data;
    }, [scheduleData, filterClass, weekDates]);

    const today = new Date();
    const todayDay = today.getDay();

    return (
        <div style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1>Lịch học</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Thời khóa biểu hàng tuần</p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        className="input"
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        style={{ width: '150px' }}
                    >
                        <option value="All">Tất cả lớp</option>
                        {classes && classes.map(cls => (
                            <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Week Navigation */}
            <div className="card" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)'
            }}>
                <button onClick={goToPrevWeek} className="btn" style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'white' }}>
                    <ChevronLeft size={18} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>Tuần: {weekLabel}</span>
                    <button onClick={goToToday} className="btn" style={{
                        padding: '4px 14px', fontSize: '0.8rem', borderRadius: '99px',
                        background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600
                    }}>
                        Hôm nay
                    </button>
                </div>
                <button onClick={goToNextWeek} className="btn" style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'white' }}>
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 'var(--space-sm)',
                overflowX: 'auto'
            }}>
                {/* Header Row */}
                {DAYS.map((day, index) => (
                    <div key={day} style={{
                        textAlign: 'center',
                        padding: 'var(--space-md)',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        borderBottom: index === todayDay ? '4px solid var(--primary)' : 'none',
                        fontWeight: '600',
                        color: index === todayDay ? 'var(--primary)' : 'var(--text-main)',
                        minWidth: '120px'
                    }}>
                        <div>{day}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {formatDate(weekDates[index])}
                        </div>
                    </div>
                ))}

                {/* Schedule Columns */}
                {DAYS.map((_, dayIndex) => {
                    const dayClasses = filteredSchedule.filter(s => s.day === dayIndex);
                    return (
                        <div key={dayIndex} style={{
                            background: 'var(--background)',
                            minHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-sm)'
                        }}>
                            {dayClasses.map((session) => {
                                const color = getClassColor(session.class);
                                return (
                                    <div key={session.id} className="card" style={{ padding: 'var(--space-sm)', borderLeft: `4px solid ${color}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{session.class}</span>
                                            <span style={{ fontSize: '0.75rem', background: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>{session.room}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <Clock size={14} />
                                            <span>{session.time}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            <Users size={14} />
                                            <span>{session.teacher}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {dayClasses.length === 0 && (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.875rem',
                                    border: '1px dashed var(--border)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    Trống
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty state khi cả tuần không có lịch nào */}
            {filteredSchedule.length === 0 && (
                <div className="card" style={{
                    textAlign: 'center', padding: 'var(--space-xl)',
                    marginTop: 'var(--space-lg)', color: 'var(--text-muted)'
                }}>
                    <Calendar size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600, fontSize: '1rem', margin: '0 0 4px' }}>Không có lịch học</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>Tuần này chưa có buổi học nào được xếp lịch{filterClass !== 'All' ? ` cho lớp "${filterClass}"` : ''}.</p>
                </div>
            )}
        </div>
    );
};

export default Schedule;
