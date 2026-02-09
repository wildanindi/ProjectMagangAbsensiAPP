import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/users';
import { absensiAPI } from '../api/absensi';
import { AlertCircle, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalInterns: 0,
        presentToday: 0,
        lateToday: 0,
        onLeaveToday: 0,
        absentToday: 0
    });
    const [usersData, setUsersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all interns
            const internsResponse = await usersAPI.getAllInterns();
            const interns = internsResponse.data || [];

            // Fetch today's attendance summary
            const summaryResponse = await absensiAPI.getAttendanceSummaryToday();
            const summData = summaryResponse.data || {};

            // Fetch users with today's attendance
            const usersResponse = await absensiAPI.getUsersWithTodayAttendance();
            const users = usersResponse.data || [];

            setUsersData(users);
            
            // Count on leave (inferred from izin API later, for now use 0)
            setStats({
                totalInterns: interns.length,
                presentToday: summData.hadir || 0,
                lateToday: summData.telat || 0,
                onLeaveToday: 0, // Will be updated from izin API
                absentToday: summData.alpha || 0
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Gagal memuat data dashboard');
            Swal.fire('Error', 'Gagal memuat data dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'HADIR': return '#10b981';
            case 'TELAT': return '#f59e0b';
            case 'ALPHA': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'HADIR': return 'Hadir';
            case 'TELAT': return 'Terlambat';
            case 'ALPHA': return 'Absen';
            default: return 'Belum Absen';
        }
    };

    return (
        <div className="admin-dashboard">
            <h1>Dashboard Admin</h1>
            <p className="subtitle">Kelola data anak magang dan monitoring kehadiran</p>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Total Anak Magang</span>
                        <Users size={20} style={{ color: '#3b82f6' }} />
                    </div>
                    <div className="stat-value">{stats.totalInterns}</div>
                    <div className="stat-footer">Peserta aktif</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Hadir Hari Ini</span>
                        <CheckCircle size={20} style={{ color: '#10b981' }} />
                    </div>
                    <div className="stat-value">{stats.presentToday}</div>
                    <div className="stat-footer">
                        {stats.totalInterns > 0 
                            ? `${Math.round((stats.presentToday / stats.totalInterns) * 100)}%` 
                            : '0%'} kehadiran
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Terlambat</span>
                        <Clock size={20} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="stat-value">{stats.lateToday}</div>
                    <div className="stat-footer">Hari ini</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Tidak Hadir</span>
                        <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                    </div>
                    <div className="stat-value">{stats.absentToday}</div>
                    <div className="stat-footer">Alpha</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Attendance Summary */}
                <div className="dashboard-card">
                    <h2>Ringkasan Kehadiran Hari Ini</h2>
                    {loading ? (
                        <div className="loading">Memuat data...</div>
                    ) : (
                        <div className="attendance-summary">
                            <div className="summary-item">
                                <span className="label">Total Peserta</span>
                                <span className="number">{stats.totalInterns}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Hadir</span>
                                <span className="number" style={{ color: '#10b981' }}>
                                    {stats.presentToday}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Terlambat</span>
                                <span className="number" style={{ color: '#f59e0b' }}>
                                    {stats.lateToday}
                                </span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Tidak Hadir</span>
                                <span className="number" style={{ color: '#ef4444' }}>
                                    {stats.absentToday}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Daftar Kehadiran */}
                <div className="dashboard-card attendance-table-card">
                    <h2>Daftar Anak Magang & Status Kehadiran</h2>
                    {loading ? (
                        <div className="loading">Memuat data...</div>
                    ) : usersData.length > 0 ? (
                        <div className="attendance-list">
                            {usersData.map((user) => (
                                <div key={user.id} className="attendance-item">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.nama.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <div className="user-name">{user.nama}</div>
                                            <div className="user-email">{user.email || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="status-badge" style={{ 
                                        backgroundColor: getStatusColor(user.status_hari_ini),
                                        color: '#fff'
                                    }}>
                                        {getStatusLabel(user.status_hari_ini)}
                                    </div>
                                    {user.jam_masuk_hari_ini && (
                                        <div className="check-time">
                                            {user.jam_masuk_hari_ini}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Tidak ada data kehadiran hari ini</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
