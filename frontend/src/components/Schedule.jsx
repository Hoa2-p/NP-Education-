<<<<<<< HEAD
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, Calendar, Clock, MapPin } from 'lucide-react';
import { scheduleAPI } from '../api';
import { toast } from 'react-toastify';

/* ─── Constants ──────────────────────────────────────── */
const HOUR_HEIGHT = 64;
const START_HOUR = 7;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

const DAYS_SHORT = ['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CHỦ NHẬT'];

const PALETTE = [
    { bg: '#dbeafe', accent: '#3b82f6', text: '#1e40af' },
    { bg: '#fef3c7', accent: '#f59e0b', text: '#92400e' },
    { bg: '#d1fae5', accent: '#10b981', text: '#065f46' },
    { bg: '#ede9fe', accent: '#8b5cf6', text: '#5b21b6' },
    { bg: '#fce7f3', accent: '#ec4899', text: '#9d174d' },
    { bg: '#ffedd5', accent: '#f97316', text: '#9a3412' },
    { bg: '#ccfbf1', accent: '#14b8a6', text: '#134e4a' },
    { bg: '#fef9c3', accent: '#eab308', text: '#854d0e' },
];

const MONTHS_VN = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

/* ─── Helpers ────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const fmtDateFull = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const parseTime = (t) => {
    if (!t) return 0;
    const p = String(t).split(':');
    return parseInt(p[0], 10) + parseInt(p[1] || 0, 10) / 60;
};

const timeStr = (t) => String(t).substring(0, 5);

const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const toLocalDateStr = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

/* ─── Component ──────────────────────────────────────── */
=======
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

>>>>>>> f84679770f73eee40a4bf2b6c780c22e5272ae72
const Schedule = ({ authUser, classes }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week');
    const [filterClass, setFilterClass] = useState('All');
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(false);
    const printRef = useRef(null);

    /* ── Fetch ── */
    useEffect(() => {
        if (!authUser) return;
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await scheduleAPI.getAll();
<<<<<<< HEAD
                setScheduleData(res.data.data || []);
            } catch (err) {
                console.error('Error fetching schedules:', err);
                toast.error('Không lấy được thời khóa biểu');
            } finally {
                setLoading(false);
=======
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
>>>>>>> f84679770f73eee40a4bf2b6c780c22e5272ae72
            }
        };
        fetch();
    }, [authUser]);

    /* ── Week dates (Mon→Sun) ── */
    const weekDates = useMemo(() => {
        const mon = getMonday(currentDate);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(mon);
            d.setDate(mon.getDate() + i);
            return d;
        });
    }, [currentDate]);

<<<<<<< HEAD
    /* ── Color map per class ── */
    const colorMap = useMemo(() => {
        const map = {};
        const names = [...new Set(scheduleData.map((s) => s.class_name))];
        names.forEach((n, i) => { map[n] = PALETTE[i % PALETTE.length]; });
        return map;
    }, [scheduleData]);

    /* ── Filter data ── */
    const filtered = useMemo(() => {
        let d = scheduleData;
        if (filterClass !== 'All') d = d.filter((s) => s.class_name === filterClass);

        if (viewMode === 'week') {
            const mon = getMonday(currentDate);
            const sun = new Date(mon);
            sun.setDate(mon.getDate() + 6);
            sun.setHours(23, 59, 59);
            d = d.filter((s) => {
                const sd = new Date(s.session_date);
                return sd >= mon && sd <= sun;
            });
        } else if (viewMode === 'month') {
            const y = currentDate.getFullYear();
            const m = currentDate.getMonth();
            d = d.filter((s) => {
                const sd = new Date(s.session_date);
                return sd.getFullYear() === y && sd.getMonth() === m;
            });
        }
=======
    // Tính ngày đầu tuần (Thứ 2)
    const getMonday = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
>>>>>>> f84679770f73eee40a4bf2b6c780c22e5272ae72
        return d;
    }, [scheduleData, filterClass, viewMode, currentDate]);

    /* ── Navigation ── */
    const goToday = () => setCurrentDate(new Date());
    const goPrev = () => {
        const d = new Date(currentDate);
        if (viewMode === 'week') d.setDate(d.getDate() - 7);
        else d.setMonth(d.getMonth() - 1);
        setCurrentDate(d);
    };
    const goNext = () => {
        const d = new Date(currentDate);
        if (viewMode === 'week') d.setDate(d.getDate() + 7);
        else d.setMonth(d.getMonth() + 1);
        setCurrentDate(d);
    };

<<<<<<< HEAD
    const handleMonthChange = (e) => {
        const d = new Date(currentDate);
        d.setMonth(parseInt(e.target.value, 10));
        setCurrentDate(d);
    };
    const handleYearChange = (e) => {
        const d = new Date(currentDate);
        d.setFullYear(parseInt(e.target.value, 10));
        setCurrentDate(d);
    };

    /* ── Export PDF ── */
    const handleExportPDF = useCallback(() => {
        window.print();
    }, []);

    /* ── Derived strings ── */
    const weekRange = `Tuần từ ${fmtDateFull(weekDates[0])} - ${fmtDateFull(weekDates[6])}`;
    const monthLabel = `${MONTHS_VN[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
    const today = new Date();

    const yearOptions = useMemo(() => {
        const cur = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => cur - 2 + i);
    }, []);

    /* ── Empty state (Student chưa enroll) ── */
    if (authUser?.role === 'Student' && !loading && scheduleData.length === 0) {
        return (
            <div className="sch-page">
                <div className="sch-empty">
                    <div className="sch-empty-icon">
                        <Calendar size={56} strokeWidth={1.2} />
                    </div>
                    <h2>Chưa có lịch học</h2>
                    <p>Bạn chưa ghi danh vào lớp học nào.<br />Vui lòng liên hệ trung tâm để đăng ký.</p>
=======
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
>>>>>>> f84679770f73eee40a4bf2b6c780c22e5272ae72
                </div>
            </div>
        );
    }

<<<<<<< HEAD
    /* ═══════════════ WEEK VIEW ═══════════════ */
    const renderWeekView = () => (
        <div className="sch-grid-wrap" ref={printRef}>
            <div className="sch-time-grid">
                {/* Time labels */}
                <div className="sch-time-col">
                    <div className="sch-time-col-header" />
                    {HOURS.map((h) => (
                        <div key={h} className="sch-time-label" style={{ height: HOUR_HEIGHT }}>
                            {pad(h)}:00
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                {weekDates.map((date, idx) => {
                    const dateStr = toLocalDateStr(date);
                    const sessions = filtered.filter((s) => toLocalDateStr(s.session_date) === dateStr);
                    const todayFlag = isSameDay(date, today);
=======
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
>>>>>>> f84679770f73eee40a4bf2b6c780c22e5272ae72

                    return (
<<<<<<< HEAD
                        <div key={idx} className={`sch-day-col ${todayFlag ? 'sch-day-today' : ''}`}>
                            {/* Header */}
                            <div className={`sch-day-hdr ${todayFlag ? 'sch-hdr-today' : ''}`}>
                                <span className="sch-day-name">{DAYS_SHORT[idx]}</span>
                                <span className={`sch-day-num ${todayFlag ? 'sch-num-today' : ''}`}>
                                    {date.getDate()}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="sch-day-body" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
                                {HOURS.map((h) => (
                                    <div key={h} className="sch-gridline" style={{ top: (h - START_HOUR) * HOUR_HEIGHT }} />
                                ))}

                                {sessions.map((s, i) => {
                                    const sH = parseTime(s.start_time);
                                    const eH = parseTime(s.end_time);
                                    const top = (sH - START_HOUR) * HOUR_HEIGHT;
                                    const height = Math.max((eH - sH) * HOUR_HEIGHT, 32);
                                    const c = colorMap[s.class_name] || PALETTE[0];

                                    return (
                                        <div key={s.session_id || i} className="sch-card" style={{
                                            top, height,
                                            background: c.bg,
                                            borderLeft: `3px solid ${c.accent}`,
                                            color: c.text,
                                        }}>
                                            <div className="sch-card-name">{s.class_name}</div>
                                            <div className="sch-card-time">
                                                {timeStr(s.start_time)} - {timeStr(s.end_time)}
                                            </div>
                                            <div className="sch-card-room">🏫 {s.room || 'Phòng học 1'}</div>
                                        </div>
                                    );
                                })}

                                {sessions.length === 0 && idx === 6 && (
                                    <div className="sch-day-empty">Không có lịch học</div>
                                )}
                            </div>
=======
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
>>>>>>> f84679770f73eee40a4bf2b6c780c22e5272ae72
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

    /* ═══════════════ MONTH VIEW ═══════════════ */
    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDow = firstDay.getDay();
        if (startDow === 0) startDow = 7; // Monday = 1
        const totalDays = lastDay.getDate();

        const cells = [];
        // Empty cells before first day
        for (let i = 1; i < startDow; i++) cells.push(null);
        // Day cells
        for (let d = 1; d <= totalDays; d++) cells.push(d);
        // Pad to fill last row
        while (cells.length % 7 !== 0) cells.push(null);

        return (
            <div className="sch-month-grid" ref={printRef}>
                {/* Header row */}
                <div className="sch-month-hdr-row">
                    {DAYS_SHORT.map((d) => (
                        <div key={d} className="sch-month-hdr-cell">{d}</div>
                    ))}
                </div>

                {/* Date cells */}
                <div className="sch-month-body">
                    {cells.map((day, idx) => {
                        if (day === null) return <div key={idx} className="sch-month-cell sch-month-cell-empty" />;

                        const cellDate = new Date(year, month, day);
                        const dateStr = toLocalDateStr(cellDate);
                        const sessions = filtered.filter((s) => toLocalDateStr(s.session_date) === dateStr);
                        const todayFlag = isSameDay(cellDate, today);

                        return (
                            <div key={idx} className={`sch-month-cell ${todayFlag ? 'sch-month-cell-today' : ''}`}>
                                <div className={`sch-month-day-num ${todayFlag ? 'sch-month-today-num' : ''}`}>{day}</div>
                                <div className="sch-month-sessions">
                                    {sessions.slice(0, 3).map((s, i) => {
                                        const c = colorMap[s.class_name] || PALETTE[0];
                                        return (
                                            <div key={i} className="sch-month-dot-row" style={{ color: c.text }}>
                                                <span className="sch-month-dot" style={{ background: c.accent }} />
                                                <span className="sch-month-dot-text">{s.class_name}</span>
                                            </div>
                                        );
                                    })}
                                    {sessions.length > 3 && (
                                        <span className="sch-month-more">+{sessions.length - 3} khác</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    /* ═══════════════ LIST VIEW ═══════════════ */
    const renderListView = () => {
        const sorted = [...filtered].sort(
            (a, b) => new Date(a.session_date) - new Date(b.session_date) || String(a.start_time).localeCompare(String(b.start_time))
        );

        if (sorted.length === 0) {
            return (
                <div className="sch-list-empty">
                    <p>Không có buổi học nào trong khoảng thời gian đã chọn.</p>
                </div>
            );
        }

        // Group by date
        const groups = {};
        sorted.forEach((s) => {
            const key = toLocalDateStr(s.session_date);
            if (!groups[key]) groups[key] = [];
            groups[key].push(s);
        });

        return (
            <div className="sch-list" ref={printRef}>
                {Object.entries(groups).map(([dateKey, sessions]) => {
                    const d = new Date(dateKey);
                    const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
                    const todayFlag = isSameDay(d, today);

                    return (
                        <div key={dateKey} className={`sch-list-group ${todayFlag ? 'sch-list-group-today' : ''}`}>
                            <div className="sch-list-date">
                                <span className="sch-list-date-day">{DAYS_SHORT[dayIdx]}</span>
                                <span className="sch-list-date-full">{fmtDateFull(d)}</span>
                                {todayFlag && <span className="sch-list-today-badge">Hôm nay</span>}
                            </div>
                            <div className="sch-list-items">
                                {sessions.map((s, i) => {
                                    const c = colorMap[s.class_name] || PALETTE[0];
                                    return (
                                        <div key={i} className="sch-list-item" style={{ borderLeft: `4px solid ${c.accent}`, background: c.bg }}>
                                            <div className="sch-list-item-main">
                                                <h4 style={{ color: c.text }}>{s.class_name}</h4>
                                                <div className="sch-list-item-meta">
                                                    <span><Clock size={14} /> {timeStr(s.start_time)} - {timeStr(s.end_time)}</span>
                                                    <span><MapPin size={14} /> {s.room || 'Phòng học 1'}</span>
                                                    {s.teacher_name && <span>👨‍🏫 {s.teacher_name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    /* ═══════════════ RENDER ═══════════════ */
    return (
        <div className="sch-page" id="schedule-print-area">
            {/* ── Header ── */}
            <div className="sch-top">
                <div className="sch-top-left">
                    <p className="sch-breadcrumb">Trang chủ / <strong>Lịch học</strong></p>
                    <h1 className="sch-title">Thời khóa biểu {authUser?.role === 'Student' ? 'cá nhân' : ''}</h1>
                    <p className="sch-subtitle">{viewMode === 'week' ? weekRange : `${MONTHS_VN[currentDate.getMonth()]} ${currentDate.getFullYear()}`}</p>
                </div>
                <div className="sch-top-right">
                    <div className="sch-tabs">
                        <button className={`sch-tab ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Tuần</button>
                        <button className={`sch-tab ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Tháng</button>
                        <button className={`sch-tab ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>Danh sách</button>
                    </div>
                    <button className="sch-export" onClick={handleExportPDF}>
                        <Download size={15} /> Xuất PDF
                    </button>
                </div>
            </div>

            {/* ── Nav bar ── */}
            <div className="sch-nav">
                <div className="sch-nav-left">
                    <button className="sch-arrow" onClick={goPrev}><ChevronLeft size={18} /></button>
                    <span className="sch-month-text">{monthLabel}</span>
                    <button className="sch-arrow" onClick={goNext}><ChevronRight size={18} /></button>
                    <button className="sch-today" onClick={goToday}>Hôm nay</button>

                    <div className="sch-pickers">
                        <select className="sch-picker" value={currentDate.getMonth()} onChange={handleMonthChange}>
                            {MONTHS_VN.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select className="sch-picker" value={currentDate.getFullYear()} onChange={handleYearChange}>
                            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="sch-nav-right">
                    <select className="sch-picker" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                        <option value="All">Tất cả lớp</option>
                        {classes && classes.map((c) => (
                            <option key={c.id} value={c.class_name}>{c.class_name}</option>
                        ))}
                    </select>

                    <div className="sch-legend">
                        {Object.entries(colorMap).slice(0, 4).map(([name, c]) => (
                            <div key={name} className="sch-legend-item">
                                <span className="sch-legend-dot" style={{ background: c.accent }} />
                                <span>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div className="sch-loading">
                    <div className="sch-spinner" />
                    <span>Đang tải lịch học...</span>
                </div>
            ) : (
                <>
                    {viewMode === 'week' && renderWeekView()}
                    {viewMode === 'month' && renderMonthView()}
                    {viewMode === 'list' && renderListView()}
                </>
            )}
        </div>
    );
};

export default Schedule;
