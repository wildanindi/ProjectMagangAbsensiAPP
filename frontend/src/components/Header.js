import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div className="greeting">{getGreeting()}, {user?.nama}</div>
                    <div className="header-date">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>

                <div className="header-user">
                    <div className="user-avatar">
                        {user?.nama?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <div className="user-role">{user?.role === 'ADMIN' ? 'Administrator' : user?.role}</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
