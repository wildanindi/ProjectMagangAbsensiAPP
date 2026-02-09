import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { absensiAPI } from '../api/absensi';
import { Clock, Download } from 'lucide-react';
import './Attendance.css';

const Attendance = () => {
    const { user } = useAuth();
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.id) {
                    const response = await absensiAPI.getUserAttendanceHistory(user.id, 100, 0);
                    setAttendanceData(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

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

    const handleExport = () => {
        alert('Fitur export akan segera tersedia');
    };

    return (
        <div className="attendance-container">
            <div className="attendance-header">
                <h1>Riwayat Kehadiran</h1>
                <div className="header-actions">
                    <select 
                        value={filterMonth} 
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="month-filter"
                    >
                        {Array.from({ length: 12 }, (_, i) => {
                            const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
                            const value = date.toISOString().slice(0, 7);
                            const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                            return <option key={value} value={value}>{label}</option>;
                        })}
                    </select>
                    <button onClick={handleExport} className="export-btn">
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="attendance-stats">
                <div className="stat-box">
                    <div className="stat-number">18</div>
                    <div className="stat-text">Tepat Waktu</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">2</div>
                    <div className="stat-text">Terlambat</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">1</div>
                    <div className="stat-text">Izin/Cuti</div>
                </div>
                <div className="stat-box">
                    <div className="stat-number">0</div>
                    <div className="stat-text">Alpha</div>
                </div>
            </div>

            <div className="attendance-table">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Hari</th>
                            <th>Jam Masuk</th>
                            <th>Jam Keluar</th>
                            <th>Jam Kerja</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center">Memuat...</td>
                            </tr>
                        ) : attendanceData.length > 0 ? (
                            attendanceData.map((record) => {
                                const date = new Date(record.tanggal);
                                const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });
                                
                                return (
                                    <tr key={record.id}>
                                        <td className="date-cell">{record.tanggal}</td>
                                        <td>{dayName}</td>
                                        <td>{record.jam_masuk || '-'}</td>
                                        <td>{record.jam_keluar || '-'}</td>
                                        <td>8j 10m</td>
                                        <td>{getStatusBadge(record.status)}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">Tidak ada data kehadiran</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;
