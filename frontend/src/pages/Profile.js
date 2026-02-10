import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../api/users';
import Swal from 'sweetalert2';
import { Edit2, Key, X } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Profile form state
    const [formData, setFormData] = useState({
        nama: user?.nama || '',
        email: user?.email || '',
        telepon: user?.telepon || ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePassword = () => {
        // Validasi password kosong
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            Swal.fire('Error', 'Semua field password harus diisi', 'error');
            return false;
        }

        // Validasi panjang password
        if (passwordData.newPassword.length < 6) {
            Swal.fire('Error', 'Password baru minimal 6 karakter', 'error');
            return false;
        }

        // Validasi password baru sama dengan saat ini
        if (passwordData.newPassword === passwordData.currentPassword) {
            Swal.fire('Error', 'Password baru tidak boleh sama dengan password lama', 'error');
            return false;
        }

        // Validasi konfirmasi password
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire('Error', 'Password baru dan konfirmasi tidak cocok', 'error');
            return false;
        }

        return true;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        try {
            setLoading(true);
            const response = await usersAPI.changePassword(user.id, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.success) {
                Swal.fire('Sukses', 'Password berhasil diubah. Silakan login kembali.', 'success');
                setShowPasswordModal(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Gagal mengubah password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const response = await usersAPI.updateUser(user.id, formData);

            if (response.success) {
                Swal.fire('Sukses', 'Profil berhasil diperbarui', 'success');
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
            {/* Profile Header */}
            <div className="profile-header-card">
                <div className="profile-header-background"></div>
                <div className="profile-header-content">
                    <div className="profile-avatar-large">
                        {user?.nama?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-header-info">
                        <h1>{user?.nama}</h1>
                        <p>{user?.role === 'ADMIN' ? 'Administrator' : 'UI/UX Intern (Intern)'}</p>
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
            </div>

            {/* Profile Content */}
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
                    <div className="profile-details-grid">
                        {/* Informasi Peserta */}
                        <div className="detail-section">
                            <h2>INFORMASI PESERTA</h2>
                            <div className="detail-row">
                                <span className="detail-icon">👤</span>
                                <div className="detail-content">
                                    <span className="detail-label">ID Magang / NIM</span>
                                    <span className="detail-value">{user?.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Data Pribadi */}
                        <div className="detail-section">
                            <h2>DATA PRIBADI</h2>
                            <div className="detail-row">
                                <span className="detail-icon">🏫</span>
                                <div className="detail-content">
                                    <span className="detail-label">Asal Kampus / Sekolah</span>
                                    <span className="detail-value">{user?.kampus || 'Universitas Teknologi Digital'}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <span className="detail-icon">✉️</span>
                                <div className="detail-content">
                                    <span className="detail-label">Email Pribadi / Kampus</span>
                                    <span className="detail-value">{user?.email || 'student@university.ac.id'}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <span className="detail-icon">📱</span>
                                <div className="detail-content">
                                    <span className="detail-label">Nomor Telepon / WhatsApp</span>
                                    <span className="detail-value">{user?.telepon || '+62 812 3456 7890'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Change Button */}
                {!isEditing && (
                    <div className="password-section">
                        <button 
                            className="change-password-btn"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            <Key size={18} />
                            <span>Ubah Password</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Ubah Password</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowPasswordModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="password-form">
                            <div className="form-group">
                                <label htmlFor="currentPassword">Password Saat Ini</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Masukkan password lama Anda"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Password Baru</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Masukkan password baru (min 6 karakter)"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Ulangi password baru Anda"
                                    disabled={loading}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-modal-cancel"
                                    onClick={() => setShowPasswordModal(false)}
                                    disabled={loading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-modal-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Mengubah...' : 'Ubah Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
