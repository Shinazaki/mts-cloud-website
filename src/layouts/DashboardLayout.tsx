import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Header } from '../components/Header/Header';
import styles from './DashboardLayout.module.css';

export const DashboardLayout: React.FC = () => {
    const location = useLocation();

    return (
        <div className={styles['dashboard-layout']}>
            <Sidebar />
            <div className={styles['dashboard-main']}>
                <Header />
                <main className={styles['dashboard-content']}>
                    <div key={location.pathname} className={styles['page-enter']}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
