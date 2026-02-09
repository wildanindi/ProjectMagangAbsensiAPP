import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username || !password) {
            Swal.fire('Error', 'Username dan password harus diisi', 'error');
            return;
        }

        try {
            setLoading(true);
            const response = await login(username, password);
            
            Swal.fire('Sukses', 'Login berhasil', 'success');
            
            // Redirect ke dashboard sesuai role
            if (response.data.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Login gagal', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">A</div>
                    <h1>AbsensiKu</h1>
                    <p>Sistem Manajemen Absensi & Cuti</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Masukkan username"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Demo: gunakan username "budi" password "123456"</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
