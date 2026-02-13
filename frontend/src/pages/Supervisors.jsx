import React, { useState, useEffect } from 'react';
import { supervisorsAPI } from '../api/supervisors';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const Supervisors = () => {
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        nohp: ''
    });

    useEffect(() => {
        fetchSupervisors();
    }, []);

    const fetchSupervisors = async () => {
        try {
            setLoading(true);
            const response = await supervisorsAPI.getAllSupervisors();
            setSupervisors(response.data || []);
        } catch (error) {
            console.error('Error fetching supervisors:', error);
            Swal.fire('Error', 'Gagal memuat data pembimbing', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nama: '',
            email: '',
            nohp: ''
        });
        setEditingId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddClick = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleEditClick = (supervisor) => {
        setFormData({
            nama: supervisor.nama || '',
            email: supervisor.email || '',
            nohp: supervisor.nohp || ''
        });
        setEditingId(supervisor.id);
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nama.trim()) {
            Swal.fire('Validasi', 'Nama pembimbing harus diisi', 'warning');
            return;
        }

        try {
            if (editingId) {
                await supervisorsAPI.updateSupervisor(editingId, formData);
                Swal.fire('Sukses', 'Data pembimbing berhasil diperbarui', 'success');
            } else {
                await supervisorsAPI.createSupervisor(formData);
                Swal.fire('Sukses', 'Data pembimbing berhasil ditambahkan', 'success');
            }

            setShowAddModal(false);
            resetForm();
            fetchSupervisors();
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.message || 'Gagal menyimpan data';
            Swal.fire('Error', errorMsg, 'error');
        }
    };

    const handleDelete = async (id, name) => {
        try {
            const result = await Swal.fire({
                title: 'Hapus Pembimbing?',
                text: `Apakah Anda yakin ingin menghapus ${name}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#ef4444'
            });

            if (result.isConfirmed) {
                await supervisorsAPI.deleteSupervisor(id);
                Swal.fire('Sukses', 'Data pembimbing berhasil dihapus', 'success');
                fetchSupervisors();
            }
        } catch (error) {
            console.error('Error deleting supervisor:', error);
            Swal.fire('Error', 'Gagal menghapus data pembimbing', 'error');
        }
    };

    const filteredSupervisors = supervisors.filter(sup =>
        sup.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sup.nohp?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="supervisors-container">
            <div className="supervisors-header">
                <h1>Data Pembimbing</h1>
                <button 
                    className="btn-add-supervisor"
                    onClick={handleAddClick}
                >
                    <Plus size={18} />
                    <span>Tambah Pembimbing</span>
                </button>
            </div>

            <div className="supervisors-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Cari nama, email, atau nomor HP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="supervisors-table">
                <table>
                    <thead>
                        <tr>
                            <th>NAMA PEMBIMBING</th>
                            <th>EMAIL</th>
                            <th>NOMOR HP</th>
                            <th>AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center">Memuat...</td>
                            </tr>
                        ) : filteredSupervisors.length > 0 ? (
                            filteredSupervisors.map((sup) => (
                                <tr key={sup.id}>
                                    <td className="supervisor-name">
                                        <div className="avatar">{sup.nama?.charAt(0).toUpperCase()}</div>
                                        <span>{sup.nama}</span>
                                    </td>
                                    <td>{sup.email || '-'}</td>
                                    <td>{sup.nohp || '-'}</td>
                                    <td>
                                        <div className="actions">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEditClick(sup)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(sup.id, sup.nama)}
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">Tidak ada data pembimbing</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Edit Pembimbing' : 'Tambah Pembimbing'}</h2>
                            <button 
                                className="btn-close" 
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Pembimbing *</label>
                                <input 
                                    type="text" 
                                    name="nama"
                                    placeholder="Nama lengkap pembimbing"
                                    value={formData.nama}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Nomor HP</label>
                                <input 
                                    type="tel" 
                                    name="nohp"
                                    placeholder="08xx-xxxx-xxxx"
                                    value={formData.nohp}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-cancel" 
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingId ? 'Perbarui' : 'Tambah'} Pembimbing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Supervisors;
