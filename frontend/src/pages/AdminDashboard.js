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
            
            // Hitung stats dari users list supaya akurat
            // (summary query mungkin belum menghitung user tanpa record)
            const hadirCount = users.filter(u => u.status_hari_ini === 'HADIR').length;
            const telatCount = users.filter(u => u.status_hari_ini === 'TELAT').length;
            const alphaCount = users.filter(u => u.status_hari_ini === 'ALPHA').length;
            const izinCount = users.filter(u => u.status_hari_ini === 'IZIN').length;

            setStats({
                totalInterns: interns.length,
                presentToday: summData.hadir || hadirCount,
                lateToday: summData.telat || telatCount,
                onLeaveToday: summData.izin || izinCount,
                absentToday: summData.alpha || alphaCount
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
            case 'IZIN': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'HADIR': return 'Hadir';
            case 'TELAT': return 'Terlambat';
            case 'ALPHA': return 'Absen';
            case 'IZIN': return 'Izin';
            default: return 'Belum Absen';
        }
    };

    const showPhoto = (photoUrl, name) => {
        if (!photoUrl) return;
        Swal.fire({
            title: `${name} — Foto Check-in`,
            imageUrl: photoUrl,
            imageAlt: 'Foto check-in',
            imageWidth: 600,
            showCloseButton: true,
            showConfirmButton: false,
        });
    };

    const resolvePhotoUrl = (path) => {
        if (!path) return null;
        // if already absolute URL (http:// or https://), use as-is
        if (/^https?:\/\//i.test(path)) return path;
        // path from backend is typically /uploads/absensi/<filename>
        // construct full URL: http://localhost:5000/uploads/absensi/<filename>
        const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const SERVER_BASE = API_BASE.replace(/\/api\/?$/, ''); // http://localhost:5000
        const p = path.startsWith('/') ? path : `/${path}`; // ensure leading /
        return `${SERVER_BASE}${p}`;
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
                        <div className="attendance-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>FOTO</th>
                                        <th>NAMA</th>
                                        <th>USERNAME</th>
                                        <th>EMAIL</th>
                                        <th>STATUS</th>
                                        <th>JAM MASUK</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersData.map((user) => {
                                        // use foto_hari_ini from today's attendance query
                                        const photoUrlRaw = user.foto_hari_ini || null;
                                        const photoUrl = resolvePhotoUrl(photoUrlRaw);
                                        return (
                                            <tr key={user.id}>
                                                <td className="photo-cell">
                                                    <div className="user-photo" onClick={() => photoUrl && showPhoto(photoUrl, user.nama)} title={photoUrl ? 'Klik untuk lihat foto' : 'Belum ada foto'}>
                                                        {photoUrl ? (
                                                            <img src={photoUrl} alt={`${user.nama} photo`} />
                                                        ) : (
                                                            <div className="user-avatar">{user.nama.charAt(0).toUpperCase()}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="user-name-cell">{user.nama}</td>
                                                <td>{user.username || '-'}</td>
                                                <td>{user.email || '-'}</td>
                                                
                                                <td>
                                                    <span className="status-badge" style={{ 
                                                        backgroundColor: getStatusColor(user.status_hari_ini),
                                                        color: '#fff'
                                                    }}>
                                                        {getStatusLabel(user.status_hari_ini)}
                                                    </span>
                                                </td>
                                                <td className="jam-masuk">
                                                    {user.jam_masuk_hari_ini || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
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
