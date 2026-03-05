import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const [isManagementOpen, setIsManagementOpen] = useState(true);
    const [isAdminOpen, setIsAdminOpen] = useState(true);
    const navigate = useNavigate();
    const { t } = useSettings();
    const { user } = useAuth();

    const role = user?.role ?? 'user';
    const isCorporateAdmin = role === 'admin-corporation' || role === 'admin';
    const isSuperAdmin = role === 'admin';

    // Mock list of servers to display in projects dropdown
    const mockServers = [
        { id: '1', name: 'WebProd-Node-01' },
        { id: '2', name: 'Database-Primary' }
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles['sidebar-logo']} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <span className={`material-symbols-outlined ${styles['logo-icon']}`}>cloud</span>
                <span className={styles['logo-text']}>MTC Cloud</span>
            </div>

            <nav className={styles['sidebar-nav']}>
                <div className={styles['nav-section']}>
                    <button
                        className={styles['nav-section-title']}
                        onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                        aria-expanded={isProjectsOpen}
                    >
                        {t('sidebar.projects')}
                        <span className={`material-symbols-outlined ${styles['chevron']} ${isProjectsOpen ? styles['chevron-open'] : ''}`}>
                            expand_more
                        </span>
                    </button>

                    <AnimatePresence initial={false}>
                        {isProjectsOpen && (
                            <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className={styles['projects-dropdown']}
                            >
                                {mockServers.map(server => (
                                    <li key={server.id} className={styles['project-item']} onClick={() => navigate(`/servers/${server.id}`)}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '8px' }}>dns</span>
                                        {server.name}
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                <div className={styles['nav-section']}>
                    <button
                        className={styles['nav-section-title'] + " " + styles['active-section']}
                        onClick={() => setIsManagementOpen((prev) => !prev)}
                        aria-expanded={isManagementOpen}
                    >
                        {t('sidebar.management')}
                        <span className={`material-symbols-outlined ${styles['chevron']} ${isManagementOpen ? styles['chevron-open'] : ''}`}>expand_more</span>
                    </button>

                    <AnimatePresence initial={false}>
                        {isManagementOpen && (
                            <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className={styles['nav-list']}
                            >
                                <li>
                                    <NavLink to="/servers" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                        <span className={`material-symbols-outlined ${styles['nav-icon']}`}>dns</span> {t('sidebar.servers')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/backups" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                        <span className={`material-symbols-outlined ${styles['nav-icon']}`}>cloud_sync</span> {t('sidebar.backups')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/monitoring" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                        <span className={`material-symbols-outlined ${styles['nav-icon']}`}>monitoring</span> {t('sidebar.monitoring')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/traffic" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                        <span className={`material-symbols-outlined ${styles['nav-icon']}`}>swap_horiz</span> {t('sidebar.traffic')}
                                    </NavLink>
                                </li>
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                <div className={styles['nav-divider']}></div>

                <div className={styles['nav-section'] + " " + styles['bottom-section']}>
                    <ul className={styles['nav-list']}>
                        <li>
                            <NavLink to="/billing" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>payments</span> {t('sidebar.billing')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/support" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>support_agent</span> {t('sidebar.support')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>settings</span> {t('sidebar.settings')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/api" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>api</span> {t('sidebar.api')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/qa" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>help_center</span> {t('sidebar.qa')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/whats-new" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>new_releases</span> {t('sidebar.whatsNew')}
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* ── Admin panels ── */}
                {(isCorporateAdmin || isSuperAdmin) && (
                    <>
                        <div className={styles['nav-divider']}></div>
                        <div className={styles['nav-section']}>
                            <button
                                className={styles['nav-section-title']}
                                onClick={() => setIsAdminOpen(prev => !prev)}
                                aria-expanded={isAdminOpen}
                                style={{ color: isSuperAdmin ? '#7c3aed' : 'var(--c-accent)' }}
                            >
                                {isSuperAdmin ? t('sidebar.admin_panel') : t('sidebar.corporate_panel')}
                                <span className={`material-symbols-outlined ${styles['chevron']} ${isAdminOpen ? styles['chevron-open'] : ''}`}>expand_more</span>
                            </button>

                            <AnimatePresence initial={false}>
                                {isAdminOpen && (
                                    <motion.ul
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className={styles['nav-list']}
                                    >
                                        {isCorporateAdmin && (
                                            <li>
                                                <NavLink to="/corporate-admin" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                                    <span className={`material-symbols-outlined ${styles['nav-icon']}`}>corporate_fare</span> {t('sidebar.corporate_admin')}
                                                </NavLink>
                                            </li>
                                        )}
                                        {isSuperAdmin && (
                                            <li>
                                                <NavLink to="/admin" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                                    <span className={`material-symbols-outlined ${styles['nav-icon']}`}>admin_panel_settings</span> {t('sidebar.super_admin')}
                                                </NavLink>
                                            </li>
                                        )}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </nav>
        </aside>
    );
};
