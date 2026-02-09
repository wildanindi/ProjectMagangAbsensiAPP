import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/users';
import { supervisorsAPI } from '../api/supervisors';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import './EmployeeData.css';

const EmployeeData = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [supervisors, setSupervisors] = useState([]);
    const [formData, setFormData] = useState({
        nama: '',
        nim: '',
        email: '',
        username: '',
        password: '123456',
        pembimbing_id: '',
        periode_mulai: '',
        periode_selesai: '',
        sisa_izin: 0
    });

    useEffect(() => {
        fetchEmployees();
        fetchSupervisors();
    }, []);

    const fetchSupervisors = async () => {
        try {
            const response = await supervisorsAPI.getAllSupervisors();
            setSupervisors(response.data || []);
        } catch (error) {
            console.error('Error fetching supervisors:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.getAllInterns();
            setEmployees(response.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
            Swal.fire('Error', 'Gagal memuat data karyawan', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nama: '',
            nim: '',
            email: '',
            username: '',
            password: '123456',
            pembimbing_id: '',
            periode_mulai: '',
            periode_selesai: '',
            sisa_izin: 0
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

    const handleEditClick = (employee) => {
        setFormData({
            nama: employee.nama || '',
            nim: employee.nim || '',
            email: employee.email || '',
            username: employee.username || '',
            password: '123456',
            pembimbing_id: employee.pembimbing_id || '',
            periode_mulai: employee.periode_mulai || '',
            periode_selesai: employee.periode_selesai || '',
            sisa_izin: employee.sisa_izin || 0
        });
        setEditingId(employee.id);
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.nama.trim()) {
            Swal.fire('Validasi', 'Nama lengkap harus diisi', 'warning');
            return;
        }

        if (!editingId && !formData.username.trim()) {
            Swal.fire('Validasi', 'Username harus diisi', 'warning');
            return;
        }

        try {
            if (editingId) {
                // Update user
                const updateData = {
                    nama: formData.nama,
                    email: formData.email,
                    pembimbing_id: formData.pembimbing_id || null,
                };
                await usersAPI.updateUser(editingId, updateData);
                Swal.fire('Sukses', 'Anak magang berhasil diperbarui', 'success');
            } else {
                // Create user - backend API expects different field names
                const createData = {
                    nama: formData.nama,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    pembimbing_id: formData.pembimbing_id || null,
                    periode_id: null,
                    sisa_izin: formData.sisa_izin || 0
                };
                await usersAPI.createUser(createData);
                Swal.fire('Sukses', 'Anak magang berhasil ditambahkan', 'success');
            }

            setShowAddModal(false);
            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.message || 'Gagal menyimpan data';
            Swal.fire('Error', errorMsg, 'error');
        }
    };

    const handleDelete = async (id, name) => {
        try {
            const result = await Swal.fire({
                title: 'Hapus Anak Magang?',
                text: `Apakah Anda yakin ingin menghapus ${name}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#ef4444'
            });

            if (result.isConfirmed) {
                await usersAPI.deleteUser(id);
                Swal.fire('Sukses', 'Anak magang berhasil dihapus', 'success');
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            Swal.fire('Error', 'Gagal menghapus anak magang', 'error');
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="employee-container">
            <div className="employee-header">
                <h1>Data Anak Magang</h1>
                <button 
                    className="btn-add-employee"
                    onClick={handleAddClick}
                >
                    <Plus size={18} />
                    <span>Tambah Magang</span>
                </button>
            </div>

            <div className="employee-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Cari nama, email, atau username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="employee-table">
                <table>
                    <thead>
                        <tr>
                            <th>NAMA</th>
                            <th>NIM / ID MAGANG</th>
                            <th>USERNAME</th>
                            <th>EMAIL</th>
                            <th>PEMBIMBING</th>
                            <th>AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center">Memuat...</td>
                            </tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                                <tr key={emp.id}>
                                    <td className="employee-name">
                                        <div className="avatar">{emp.nama?.charAt(0).toUpperCase()}</div>
                                        <span>{emp.nama}</span>
                                    </td>
                                    <td>{emp.nim || '-'}</td>
                                    <td>{emp.username}</td>
                                    <td>{emp.email || '-'}</td>
                                    <td>{emp.nama ? `${emp.nama}` : '-'}</td>
                                    <td>
                                        <div className="actions">
                                            <button 
                                                className="btn-edit"
                                                onClick={() => handleEditClick(emp)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                className="btn-delete"
                                                onClick={() => handleDelete(emp.id, emp.nama)}
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
                                <td colSpan="6" className="text-center">Tidak ada data anak magang</td>
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
                            <h2>{editingId ? 'Edit Anak Magang' : 'Tambah Peserta Magang'}</h2>
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
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nama Lengkap *</label>
                                    <input 
                                        type="text" 
                                        name="nama"
                                        placeholder="Nama mahasiswa"
                                        value={formData.nama}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>NIM / ID Magang</label>
                                    <input 
                                        type="text" 
                                        name="nim"
                                        placeholder="MAG-2026-735"
                                        value={formData.nim}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mentor Pembimbing</label>
                                <select 
                                    name="pembimbing_id"
                                    value={formData.pembimbing_id}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Pilih Mentor...</option>
                                    {supervisors.map(supervisor => (
                                        <option key={supervisor.id} value={supervisor.id}>
                                            {supervisor.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Periode Mulai</label>
                                    <input 
                                        type="date" 
                                        name="periode_mulai"
                                        value={formData.periode_mulai}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Periode Selesai</label>
                                    <input 
                                        type="date" 
                                        name="periode_selesai"
                                        value={formData.periode_selesai}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Kampus / Pribadi</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-section-title">AKUN LOGIN PESERTA</div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input 
                                        type="text" 
                                        name="username"
                                        placeholder="Auto-generated"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={editingId}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input 
                                        type="text" 
                                        name="password"
                                        placeholder="Default: 123456"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled
                                    />
                                </div>
                            </div>

                            <p className="form-note">*Username akan digenerate otomatis jika dikosongkan.</p>

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
                                    {editingId ? 'Perbarui Peserta' : 'Tambah Peserta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeData;
