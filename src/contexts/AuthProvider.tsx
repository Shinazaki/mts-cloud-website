// src/contexts/AuthProvider.tsx
import React, { useState } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../types/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Lazy initialization of state to avoid useEffect mount issues
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(() => {
        const savedToken = localStorage.getItem('token');
        return savedToken ? { name: 'Пользователь', username: 'user' } : null;
    });

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser({ ...userData, name: userData.firstName || 'Пользователь' });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
