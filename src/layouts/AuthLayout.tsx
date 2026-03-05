import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AuthLayout.module.css';

export const AuthLayout: React.FC = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <div className={styles['auth-layout']}>
            {/* Abstract Background Shapes */}
            <div className={styles['auth-bg-shape'] + " " + styles['shape-left']}></div>
            <div className={styles['auth-bg-shape'] + " " + styles['shape-right']}></div>

            {/* Header specific to Auth Pages */}
            <header className={styles['auth-header']}>
                <div className={styles['auth-logo']}>
                    <div className={styles['logo-pill']}>
                        <span className={`material-symbols-outlined ${styles['logo-icon-white']}`}>cloud</span>
                        <span className={styles['logo-text-white']}>MTC Cloud</span>
                    </div>
                </div>
                <div className={styles['auth-header-links']}>
                    {isLogin ? (
                        <>
                            <span className={styles['auth-hint']}>Ещё не зарегистрированы?</span>
                            <Link to="/register" className={styles['auth-link']}>Регистрация</Link>
                        </>
                    ) : (
                        <>
                            <span className={styles['auth-hint']}>Уже зарегистрированы?</span>
                            <Link to="/login" className={styles['auth-link']}>Войти</Link>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className={styles['auth-main']}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
