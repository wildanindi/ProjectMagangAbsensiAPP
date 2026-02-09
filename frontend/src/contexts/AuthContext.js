import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await authAPI.login(username, password);
            
            if (response.success) {
                const userData = response.data;
                const token = userData.token;
                
                // Remove token from userData before storing
                const userDataToStore = { ...userData };
                delete userDataToStore.token;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userDataToStore));
                setUser(userDataToStore);
                return response;
            }
            throw new Error(response.message || 'Login failed');
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
