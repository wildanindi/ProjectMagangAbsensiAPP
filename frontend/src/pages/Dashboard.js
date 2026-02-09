import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { absensiAPI } from '../api/absensi';
import { izinAPI } from '../api/izin';
import { MapPin, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [leaveSummary, setLeaveSummary] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.id) {
                    // Fetch attendance summary
                    const summaryResponse = await absensiAPI.getAttendanceStats();
                    setAttendanceSummary(summaryResponse.data);

                    // Fetch recent activities
                    const historyResponse = await absensiAPI.getUserAttendanceHistory(5, 0);
                    setRecentActivities(historyResponse.data || []);

                    // Fetch leave summary
                    try {
                        const leaveSummaryResponse = await izinAPI.getUserLeaveSummary();
                        setLeaveSummary(leaveSummaryResponse.data);
                    } catch (error) {
                        console.error('Error fetching leave summary:', error);
                    }

                    // Get leave balance from user (if available)
                    if (user?.sisa_izin) {
                        setLeaveBalance(user.sisa_izin);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'HADIR': { label: 'Hadir', className: 'badge-success' },
            'TERLAMBAT': { label: 'Terlambat', className: 'badge-warning' },
            'IZIN': { label: 'Izin', className: 'badge-info' },
            'SAKIT': { label: 'Sakit', className: 'badge-danger' },
            'ALPHA': { label: 'Alpha', className: 'badge-secondary' }
        };
        const statusInfo = statusMap[status] || { label: status, className: 'badge-secondary' };
        return <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    return (
        <div className="dashboard">
            <h1>Selamat Pagi, {user?.nama}</h1>

            {/* Current Time Card */}
            <div className="time-card">
                <div className="time-display">
                    <div className="time-value">{formatTime(currentTime)}</div>
                    <div className="time-unit">31 Detik</div>
                </div>
                <div className="location-info">
                    <MapPin size={20} />
                    <div>
                        <div className="location-label">Lokasi</div>
                        <div className="location-value">Kantor Pusat, Jakarta</div>
                    </div>
                </div>
            </div>

            {/* Leave Balance Card */}
            {/* <div className="leave-balance-card">
                <div className="leave-balance-header">
                    <Calendar size={24} />
                    <h3>Sisa Jatah Izin/Cuti</h3>
                </div>
                <div className="leave-balance-content">
                    <div className="leave-balance-number">{leaveBalance}</div>
                    <div className="leave-balance-subtitle">Hari Tersisa Tahun Ini</div>
                    <div className="leave-balance-actions">
                        <button className="btn-view-leave" onClick={() => navigate('/leave-request')}>
                            Lihat Detail
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Status Kehadiran */}
            <div className="status-card">
                <div className="status-header">Status Kehadiran</div>
                <div className="status-message">
                    Anda belum melakukan check-in hari ini. Silakan absen untuk memulai jam kerja.
                </div>
                <button className="check-in-btn" onClick={() => navigate('/leave-request')}>
                    Check In
                </button>
            </div>

            {/* Summary Stats */}
            {attendanceSummary && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#10b981' }}>
                            {attendanceSummary.hadir || 0}
                        </div>
                        <div className="stat-label">HADIR</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#f59e0b' }}>
                            {attendanceSummary.terlambat || 0}
                        </div>
                        <div className="stat-label">TERLAMBAT</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#3b82f6' }}>
                            {attendanceSummary.izin || 0}
                        </div>
                        <div className="stat-label">IZIN/CUTI</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: '#ef4444' }}>
                            {attendanceSummary.alpha || 0}
                        </div>
                        <div className="stat-label">ALPHA</div>
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            <div className="activities-section">
                <div className="section-header">
                    <h2>Aktivitas Terkini</h2>
                    <a href="/attendance" className="see-all-link">Lihat Semua</a>
                </div>

                {loading ? (
                    <div className="loading">Memuat...</div>
                ) : recentActivities.length > 0 ? (
                    <div className="activities-list">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className="activity-date">
                                    <Clock size={18} />
                                    <span>{activity.tanggal}</span>
                                </div>
                                <div className="activity-times">
                                    <div>
                                        <span className="time-label">Masuk:</span>
                                        <span className="time-value">{activity.jam_masuk || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="time-label">Keluar:</span>
                                        <span className="time-value">{activity.jam_keluar || '-'}</span>
                                    </div>
                                </div>
                                {getStatusBadge(activity.status)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-activities">Belum ada aktivitas</div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
