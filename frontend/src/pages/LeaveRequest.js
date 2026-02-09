import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { izinAPI } from '../api/izin';
import Swal from 'sweetalert2';
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

            <div className="leave-info-section">
                <div className="info-card">
                    <div className="info-label">Sisa Izin Anda</div>
                    <div className="info-value">{user?.sisa_izin || 0} Hari</div>
                </div>
            </div>

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
                <h2>Riwayat Pengajuan Izin</h2>
                <div className="no-history">Belum ada pengajuan izin</div>
            </div>
        </div>
    );
};

export default LeaveRequest;
