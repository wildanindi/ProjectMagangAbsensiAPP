import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { izinAPI } from '../api/izin';
import Swal from 'sweetalert2';
import { Calendar, AlertCircle, XCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import './LeaveRequest.css';

const LeaveRequest = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        jenis_izin: 'CUTI',
        tanggal_mulai: '',
        tanggal_selesai: '',
        alasan: ''
    });
    const [loading, setLoading] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [leaveBalance, setLeaveBalance] = useState(0);

    useEffect(() => {
        fetchLeaveRequests();
        fetchLeaveBalance();
    }, [user]);

    const fetchLeaveRequests = async () => {
        try {
            setHistoryLoading(true);
            const response = await izinAPI.getUserLeaveRequests();
            setLeaveRequests(response.data || []);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchLeaveBalance = async () => {
        try {
            if (user?.sisa_izin !== undefined) {
                setLeaveBalance(user.sisa_izin);
            }
        } catch (error) {
            console.error('Error fetching leave balance:', error);
        }
    };

    const calculateDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { label: 'Menunggu', className: 'badge-pending', icon: <Clock size={16} /> },
            'APPROVED': { label: 'Disetujui', className: 'badge-approved', icon: <CheckCircle size={16} /> },
            'REJECTED': { label: 'Ditolak', className: 'badge-rejected', icon: <XCircle size={16} /> }
        };
        const statusInfo = statusMap[status] || { label: status, className: 'badge-pending' };
        return (
            <span className={`badge ${statusInfo.className}`}>
                {statusInfo.icon} {statusInfo.label}
            </span>
        );
    };

    const getLeaveTypeLabel = (type) => {
        const typeMap = {
            'SAKIT': 'Sakit',
            'CUTI': 'Cuti Tahunan',
            'IZIN_KHUSUS': 'Izin Khusus'
        };
        return typeMap[type] || type;
    };

    const handleCancelRequest = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Batalkan Pengajuan?',
                text: 'Pengajuan izin yang dibatalkan tidak dapat dikembalikan.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Batalkan',
                cancelButtonText: 'Tidak',
                confirmButtonColor: '#ef4444'
            });

            if (result.isConfirmed) {
                await izinAPI.deleteLeaveRequest(id);
                Swal.fire('Dibatalkan', 'Pengajuan izin berhasil dibatalkan', 'success');
                fetchLeaveRequests();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal membatalkan pengajuan', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tanggal_mulai || !formData.tanggal_selesai || !formData.alasan) {
            Swal.fire('Error', 'Semua field harus diisi', 'error');
            return;
        }

        if (new Date(formData.tanggal_mulai) > new Date(formData.tanggal_selesai)) {
            Swal.fire('Error', 'Tanggal mulai harus sebelum tanggal selesai', 'error');
            return;
        }

        try {
            setLoading(true);
            const leaveData = {
                user_id: user.id,
                ...formData
            };

            const response = await izinAPI.createLeaveRequest(leaveData);

            if (response.success) {
                Swal.fire('Sukses', 'Pengajuan izin berhasil dibuat', 'success');
                setFormData({
                    jenis_izin: 'CUTI',
                    tanggal_mulai: '',
                    tanggal_selesai: '',
                    alasan: ''
                });
                fetchLeaveRequests();
                fetchLeaveBalance();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal membuat pengajuan izin', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="leave-container">
            <h1>Pengajuan Izin</h1>

            {/* <div className="leave-info-section">
                <div className="info-card">
                    <div className="info-label">Sisa Izin Anda</div>
                    <div className="info-value">{user?.sisa_izin || 0} Hari</div>
                </div>
            </div> */}

            <div className="leave-form-section">
                <h2>Formulir Pengajuan Izin</h2>

                <form onSubmit={handleSubmit} className="leave-form">
                    <div className="form-group">
                        <label htmlFor="jenis_izin">Jenis Izin</label>
                        <select
                            id="jenis_izin"
                            name="jenis_izin"
                            value={formData.jenis_izin}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="SAKIT">Sakit</option>
                            <option value="CUTI">Cuti Tahunan</option>
                            <option value="IZIN_KHUSUS">Izin Khusus</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tanggal_mulai">Tanggal Mulai</label>
                            <input
                                type="date"
                                id="tanggal_mulai"
                                name="tanggal_mulai"
                                value={formData.tanggal_mulai}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tanggal_selesai">Tanggal Selesai</label>
                            <input
                                type="date"
                                id="tanggal_selesai"
                                name="tanggal_selesai"
                                value={formData.tanggal_selesai}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="alasan">Alasan</label>
                        <textarea
                            id="alasan"
                            name="alasan"
                            value={formData.alasan}
                            onChange={handleChange}
                            placeholder="Jelaskan alasan pengajuan izin Anda..."
                            rows="4"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel">Batal</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Memproses...' : 'Kirim Pengajuan'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="leave-history-section">
                <div className="history-header">
                    <h2>Riwayat Pengajuan Izin</h2>
                    <div className="history-filters">
                        <span className="filter-label">Total Permohonan: {leaveRequests.length}</span>
                    </div>
                </div>

                {historyLoading ? (
                    <div className="loading">Memuat riwayat izin...</div>
                ) : leaveRequests.length > 0 ? (
                    <div className="leave-table-wrapper">
                        <table className="leave-table">
                            <thead>
                                <tr>
                                    <th>Jenis Izin</th>
                                    <th>Tanggal Mulai</th>
                                    <th>Tanggal Selesai</th>
                                    <th>Durasi</th>
                                    <th>Status</th>
                                    <th>Alasan</th>
                                    <th>Keterangan Admin</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.map((request) => (
                                    <tr key={request.id}>
                                        <td className="type-cell">{getLeaveTypeLabel(request.jenis_izin)}</td>
                                        <td>{new Date(request.tanggal_mulai).toLocaleDateString('id-ID')}</td>
                                        <td>{new Date(request.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                                        <td className="duration-cell">{calculateDays(request.tanggal_mulai, request.tanggal_selesai)} Hari</td>
                                        <td>{getStatusBadge(request.status)}</td>
                                        <td className="note-cell">{request.alasan || '-'}</td>
                                        <td className="note-cell">
                                            {request.status === 'REJECTED' && request.keterangan ? (
                                                <span className="rejection-reason">
                                                    <XCircle size={14} />
                                                    {request.keterangan}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {request.status === 'PENDING' ? (
                                                <button
                                                    className="btn-cancel-request"
                                                    onClick={() => handleCancelRequest(request.id)}
                                                    title="Batalkan pengajuan"
                                                >
                                                    <Trash2 size={15} />
                                                    <span>Batalkan</span>
                                                </button>
                                            ) : (
                                                <span className="no-action">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-history">
                        <AlertCircle size={32} />
                        <p>Belum ada pengajuan izin</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveRequest;
