import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/users';
import { Plus, Search } from 'lucide-react';
import './EmployeeData.css';

const EmployeeData = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await usersAPI.getAllUsers();
            setEmployees(response.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="employee-container">
            <div className="employee-header">
                <h1>Data Karyawan</h1>
                <button 
                    className="btn-add-employee"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={18} />
                    <span>Tambah Karyawan</span>
                </button>
            </div>

            <div className="employee-search">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Cari nama atau ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="employee-table">
                <table>
                    <thead>
                        <tr>
                            <th>NAMA KARYAWAN</th>
                            <th>ID & ROLE</th>
                            <th>DEPARTEMEN</th>
                            <th>KONTAK</th>
                            <th>AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center">Memuat...</td>
                            </tr>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map((emp) => (
                                <tr key={emp.id}>
                                    <td className="employee-name">
                                        <div className="avatar">{emp.nama?.charAt(0).toUpperCase()}</div>
                                        <span>{emp.nama}</span>
                                    </td>
                                    <td>
                                        <div className="id-role">
                                            <div className="emp-id">{emp.id}</div>
                                            <div className="emp-role">{emp.role}</div>
                                        </div>
                                    </td>
                                    <td>{emp.department || '-'}</td>
                                    <td>
                                        <div className="contact">
                                            <div>{emp.email || '-'}</div>
                                            <div className="phone">{emp.phone || '-'}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn-edit">Edit</button>
                                            <button className="btn-delete">Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">Tidak ada data karyawan</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tambah Peserta Magang</h2>
                            <button className="btn-close" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <form className="modal-form">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input type="text" placeholder="Nama mahasiswa" />
                            </div>
                            <div className="form-group">
                                <label>NIM / ID Magang</label>
                                <input type="text" placeholder="MAG-2026-735" />
                            </div>
                            <div className="form-group">
                                <label>Mentor Pembimbing</label>
                                <select>
                                    <option>Pilih Mentor...</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Periode Mulai</label>
                                    <input type="date" placeholder="mm/dd/yyyy" />
                                </div>
                                <div className="form-group">
                                    <label>Periode Selesai</label>
                                    <input type="date" placeholder="mm/dd/yyyy" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Kampus / Pribadi</label>
                                <input type="email" />
                            </div>
                            <div className="form-section-title">AKUN LOGIN PESERTA</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" placeholder="Auto-generated" disabled />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="text" placeholder="Default: 123456" disabled />
                                </div>
                            </div>
                            <p className="form-note">*Username akan digenerate otomatis jika dikosongkan.</p>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Batal</button>
                                <button type="submit" className="btn-submit">Tambah Peserta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeData;
