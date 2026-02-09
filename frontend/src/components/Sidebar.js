import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    FileText,
    User,
    Users,
    UserCheck,
    LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const isActive = (path) => location.pathname === path;

    const adminMenu = [
        { path: '/admin/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
        { path: '/admin/employees', label: 'Data Anak Magang', icon: Users },
        { path: '/admin/supervisors', label: 'Data Pembimbing', icon: UserCheck },
        { path: '/admin/leave-approvals', label: 'Persetujuan Izin', icon: FileText }
    ];

    const userMenu = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/attendance', label: 'Riwayat Absensi', icon: Clock },
        { path: '/leave-request', label: 'Pengajuan Izin', icon: FileText },
        { path: '/profile', label: 'Profil Saya', icon: User }
    ];

    const menu = user?.role === 'ADMIN' ? adminMenu : userMenu;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <span className="brand-icon">A</span>
                    <span className="brand-name">AbsensiKu</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menu.map(item => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Keluar</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
