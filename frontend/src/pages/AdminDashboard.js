import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/users';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        onLeave: 0,
        absent: 0,
        late: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await usersAPI.getAllUsers();
                setStats({
                    totalEmployees: response.data?.length || 0,
                    presentToday: 42,
                    onLeave: 4,
                    absent: 2,
                    late: 1
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="admin-dashboard">
            <h1>Dashboard Admin</h1>
            <p className="subtitle">Kelola data karyawan dan absensi</p>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Total Karyawan</span>
                        <span className="stat-change positive">↑ +2</span>
                    </div>
                    <div className="stat-value">{stats.totalEmployees}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Hadir Hari Ini</span>
                        <span className="stat-change positive">87%</span>
                    </div>
                    <div className="stat-value">{stats.presentToday}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Izin / Cuti</span>
                        <span className="stat-change negative">↓ -1</span>
                    </div>
                    <div className="stat-value">{stats.onLeave}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Terlambat</span>
                        <span className="stat-change positive">↑ +1</span>
                    </div>
                    <div className="stat-value">{stats.late}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h2>Kehadiran Hari Ini</h2>
                    <div className="attendance-summary">
                        <div className="summary-item">
                            <span className="label">Karyawan</span>
                            <span className="number">49</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Hadir</span>
                            <span className="number" style={{ color: '#10b981' }}>42</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Izin</span>
                            <span className="number" style={{ color: '#3b82f6' }}>4</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Terlambat</span>
                            <span className="number" style={{ color: '#f59e0b' }}>2</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h2>Butuh Persetujuan</h2>
                    <div className="approval-list">
                        <div className="approval-item">
                            <div className="approval-name">Siti Rahma</div>
                            <div className="approval-type">Marketing • Sakit</div>
                            <div className="approval-date">25 Okt 2023 (1 Hari)</div>
                            <button className="btn-approve">Setujui</button>
                        </div>
                        <div className="approval-item">
                            <div className="approval-name">Ahmad Rizki</div>
                            <div className="approval-type">Developer • Cuti Tahunan</div>
                            <div className="approval-date">1-3 Nov 2023 (3 Hari)</div>
                            <button className="btn-approve">Setujui</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
