import React, { useState, useEffect } from 'react';
import { izinAPI } from '../api/izin';
import { Calendar, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';

const LeaveApprovals = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('PENDING');

    useEffect(() => {
        fetchLeaveRequests();
    }, [filterStatus]);

    const fetchLeaveRequests = async () => {
        try {
            const response = await izinAPI.getAllLeaveRequests(filterStatus === 'ALL' ? null : filterStatus);
            setLeaveRequests(response.data || []);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Setujui Pengajuan?',
                text: 'Apakah Anda yakin ingin menyetujui pengajuan izin ini?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Setujui',
                cancelButtonText: 'Batal'
            });

            if (result.isConfirmed) {
                await izinAPI.approveLeaveRequest(id);
                Swal.fire('Sukses', 'Pengajuan izin telah disetujui', 'success');
                fetchLeaveRequests();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal menyetujui pengajuan', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            const { value: keterangan } = await Swal.fire({
                title: 'Tolak Pengajuan?'
                ,input: 'textarea',
                inputLabel: 'Keterangan penolakan (opsional)',
                inputPlaceholder: 'Masukkan alasan atau catatan penolakan...',
                inputAttributes: {
                    'aria-label': 'Keterangan penolakan'
                },
                showCancelButton: true,
                confirmButtonText: 'Tolak',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#ef4444'
            });

            if (keterangan !== undefined) {
                // If user pressed confirm, keterangan will be the textarea value (can be empty string)
                // If user pressed cancel, keterangan will be undefined
                if (keterangan === null) return; // safeguard

                await izinAPI.rejectLeaveRequest(id, keterangan);
                Swal.fire('Sukses', 'Pengajuan izin telah ditolak', 'success');
                fetchLeaveRequests();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal menolak pengajuan', 'error');
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': { label: 'Menunggu', className: 'badge-warning' },
            'APPROVED': { label: 'Disetujui', className: 'badge-success' },
            'REJECTED': { label: 'Ditolak', className: 'badge-danger' }
        };
        const statusInfo = statusMap[status] || { label: status, className: 'badge-secondary' };
        return <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    return (
        <div className="leave-approvals-container">
            <div className="approvals-header">
                <h1>Persetujuan Pengajuan Izin</h1>
                <div className="filter-tabs">
                    <button 
                        className={`filter-tab ${filterStatus === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('ALL')}
                    >
                        Semua ({leaveRequests.length})
                    </button>
                    <button 
                        className={`filter-tab ${filterStatus === 'PENDING' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('PENDING')}
                    >
                        Menunggu
                    </button>
                    <button 
                        className={`filter-tab ${filterStatus === 'APPROVED' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('APPROVED')}
                    >
                        Disetujui
                    </button>
                    <button 
                        className={`filter-tab ${filterStatus === 'REJECTED' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('REJECTED')}
                    >
                        Ditolak
                    </button>
                </div>
            </div>

            <div className="approvals-list">
                {loading ? (
                    <div className="loading">Memuat...</div>
                ) : leaveRequests.length > 0 ? (
                    leaveRequests.map((request) => (
                        <div key={request.id} className="approval-card">
                            <div className="approval-header">
                                <div className="employee-info">
                                    <div className="avatar">
                                        {request.nama?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="employee-name">{request.nama}</div>
                                        <strong className="employee-dept">{request.role}  {request.status}</strong>
                                    </div>
                                </div>
                                {getStatusBadge(request.status)}
                            </div>

                            <div className="approval-dates">
                                <span><Calendar size={20} /> {formatDate(request.tanggal_mulai)} s/d {formatDate(request.tanggal_selesai)}</span>
                            </div>

                            <div className="approval-reason">
                                <strong>Alasan:</strong> {request.alasan}
                            </div>

                            {request.status === 'PENDING' && (
                                <div className="approval-actions">
                                    <button 
                                        className="btn-reject"
                                        onClick={() => handleReject(request.id)}
                                    >
                                        <X size={16} />
                                        <span>Tolak</span>
                                    </button>
                                    <button 
                                        className="btn-approve-action"
                                        onClick={() => handleApprove(request.id)}
                                    >
                                        <Check size={16} />
                                        <span>Setujui</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-data">Tidak ada pengajuan izin {filterStatus !== 'ALL' ? `dengan status ${filterStatus}` : ''}</div>
                )}
            </div>
        </div>
    );
};

export default LeaveApprovals;
