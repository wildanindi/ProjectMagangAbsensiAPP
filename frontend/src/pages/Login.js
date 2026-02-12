import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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
            <div className="login-background"></div>
            
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <span>I</span>
                    </div>
                    <h1>Portal Internship</h1>
                    <p>Silakan masuk untuk akses log book & absensi</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username / Email</label>
                        <div className="input-wrapper">
                            <User size={20} className="input-icon" />
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                    </div>


                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={loading}
                    >
                        <span>{loading ? 'Memproses...' : 'Masuk Portal'}</span>
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div className="login-divider"></div>

                <div className="login-signup">
                    <p>Belum punya akun? <a href="#">Hubungi Mentor Program</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
