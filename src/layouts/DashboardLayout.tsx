import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { Header } from '../components/Header/Header';
import { useAuth } from '../hooks/useAuth';
import { api } from '../api/client';
import styles from './DashboardLayout.module.css';

export const DashboardLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token, updateUser } = useAuth();

    // If we have a token but no roles (old persisted session or first load),
    // fetch the fresh user profile to get the roles array from the API.
    useEffect(() => {
        if (token && user?.id && !user?.roles) {
            api.users.getById(String(user.id))
                .then(res => {
                    if (Array.isArray(res.data?.roles)) {
                        updateUser({
                            roles: res.data.roles,
                            email: res.data.email ?? user.email,
                            firstName: res.data.firstName ?? user.firstName,
                            lastName: res.data.lastName ?? user.lastName,
                            surName: res.data.surName ?? user.surName,
                            phoneNumber: res.data.phoneNumber ?? user.phoneNumber,
                            balance: res.data.balance ?? user.balance,
                        });
                        // Redirect stale-session admin to the admin panel
                        const isAdmin = (res.data.roles as Array<{ role: string }>)
                            .some(r => r.role === 'admin');
                        if (isAdmin && location.pathname === '/servers') {
                            navigate('/admin', { replace: true });
                        }
                    }
                })
                .catch(() => { /* silent – keep using existing user state */ });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, user?.id]);

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
