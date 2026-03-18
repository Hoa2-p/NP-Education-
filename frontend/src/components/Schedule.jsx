import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { scheduleAPI } from '../api';
import { toast } from 'react-toastify';

const Schedule = ({ authUser, classes }) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [filterClass, setFilterClass] = useState('All');
    const [scheduleData, setScheduleData] = useState([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const res = await scheduleAPI.getAll();
                // Map API data back to frontend structure
                const formattedSchedules = res.data.data.map(item => ({
                    id: item.schedule_id,
                    day: new Date(item.date).getDay(), // 0=Sunday, 1=Monday...
                    time: `${item.start_time.substring(0, 5)} - ${item.end_time.substring(0, 5)}`,
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

    // Get start of the current week (Sunday)
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to make Monday start if needed, but standard is Sunday=0. Let's start Monday=1
        // Let's stick to standard JS GetDay: 0=Sun, 1=Mon...
        // Let's just show a generic "Tuần này" view for now to keep it simple, or calculate dates.
        // For simplicity in this version, let's just assume a static weekly view without date navigation logic first, 
        // as the requirement is "Weekly Calendar View".
        return d;
    };

    const filteredSchedule = filterClass === 'All'
        ? scheduleData
        : scheduleData.filter(item => item.class === filterClass);

    return (
        <div style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <div>
                    <h1>Lịch học</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Thời khóa biểu hàng tuần</p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
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
                        borderBottom: index === new Date().getDay() ? '4px solid var(--primary)' : 'none',
                        fontWeight: '600',
                        color: index === new Date().getDay() ? 'var(--primary)' : 'var(--text-main)',
                        minWidth: '120px'
                    }}>
                        {day}
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
                            {dayClasses.map((session, i) => (
                                <div key={session.id} className="card" style={{ padding: 'var(--space-sm)', borderLeft: `4px solid ${['#10b981', '#3b82f6', '#8b5cf6', '#f97316'][i % 4]}` }}>
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
                            ))}
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
        </div>
    );
};

export default Schedule;
