import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../api/users';
import Swal from 'sweetalert2';
import { Edit2 } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: user?.nama || '',
        email: user?.email || '',
        telepon: user?.telepon || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await usersAPI.updateUser(user.id, formData);

            if (response.success) {
                Swal.fire('Sukses', 'Profil berhasil dipbarui', 'success');
                setIsEditing(false);
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal update profil', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user?.nama?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h1>{user?.nama}</h1>
                    <p>{user?.role === 'ADMIN' ? 'Administrator' : 'Employee'}</p>
                </div>
                {!isEditing && (
                    <button 
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                    >
                        <Edit2 size={18} />
                        <span>Edit Profil</span>
                    </button>
                )}
            </div>

            <div className="profile-content">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label>Nama Lengkap</label>
                            <input
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nomor Telepon</label>
                            <input
                                type="tel"
                                name="telepon"
                                value={formData.telepon}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn-cancel"
                                onClick={() => setIsEditing(false)}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-details">
                        <div className="detail-section">
                            <h2>Informasi Pribadi</h2>
                            <div className="detail-row">
                                <span className="label">ID Karyawan</span>
                                <span className="value">{user?.id}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Email</span>
                                <span className="value">{user?.email || '-'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Username</span>
                                <span className="value">{user?.username}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Telepon</span>
                                <span className="value">{user?.telepon || '-'}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h2>Informasi Pekerjaan</h2>
                            <div className="detail-row">
                                <span className="label">Tipe Pengguna</span>
                                <span className="value badge">{user?.role === 'USER' ? 'Anak Magang' : user?.role || '-'}</span>
                            </div>
                            {user?.nim && (
                                <div className="detail-row">
                                    <span className="label">NIM / ID Magang</span>
                                    <span className="value">{user.nim}</span>
                                </div>
                            )}
                            {user?.pembimbing_id && (
                                <div className="detail-row">
                                    <span className="label">Pembimbing ID</span>
                                    <span className="value">{user.pembimbing_id}</span>
                                </div>
                            )}
                            {user?.periode_id && (
                                <div className="detail-row">
                                    <span className="label">Periode ID</span>
                                    <span className="value">{user.periode_id}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <span className="label">Sisa Izin/Cuti</span>
                                <span className="value badge-info">{user?.sisa_izin || 0} hari</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
