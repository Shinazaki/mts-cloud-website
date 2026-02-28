import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './AuthLayout.css';

export const AuthLayout: React.FC = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <div className="auth-layout">
            {/* Abstract Background Shapes */}
            <div className="auth-bg-shape shape-left"></div>
            <div className="auth-bg-shape shape-right"></div>

            {/* Header specific to Auth Pages */}
            <header className="auth-header">
                <div className="auth-logo">
                    <div className="logo-pill">
                        <span className="material-symbols-outlined logo-icon-white">egg</span>
                        <span className="logo-text-white">MTC Cloud</span>
                    </div>
                </div>
                <div className="auth-header-links">
                    {isLogin ? (
                        <>
                            <span className="auth-hint">Ещё не зарегистрированы?</span>
                            <Link to="/register" className="auth-link">Регистрация</Link>
                        </>
                    ) : (
                        <>
                            <span className="auth-hint">Уже зарегистрированы?</span>
                            <Link to="/login" className="auth-link">Войти</Link>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="auth-main">
                <Outlet />
            </main>
        </div>
    );
};
