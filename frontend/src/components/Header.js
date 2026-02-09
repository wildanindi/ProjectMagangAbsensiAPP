import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
    const { user } = useAuth();

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-date">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
                <div className="header-user">
                    <div className="user-avatar">
                        {user?.nama?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.nama}</div>
                        <div className="user-role">{user?.role === 'ADMIN' ? 'Administrator' : user?.role}</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
