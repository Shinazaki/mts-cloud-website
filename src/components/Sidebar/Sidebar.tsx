import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../hooks/useSettings';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const [isManagementOpen, setIsManagementOpen] = useState(true);
    const navigate = useNavigate();
    const { t } = useSettings();

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
                        {t('projects')}
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
                        {t('management')}
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
                                        <span className={`material-symbols-outlined ${styles['nav-icon']}`}>dns</span> {t('servers')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/backups" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                        <span className={`material-symbols-outlined ${styles['nav-icon']}`}>cloud_sync</span> {t('backups')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/monitoring" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                        <span className={`material-symbols-outlined ${styles['nav-icon']}`}>monitoring</span> {t('monitoring')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/traffic" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                        <span className={`material-symbols-outlined ${styles['nav-icon']}`}>swap_horiz</span> {t('traffic')}
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
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>payments</span> {t('billing')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/support" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>support_agent</span> {t('support')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>settings</span> {t('settings')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/api" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>api</span> {t('api')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/qa" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>help_center</span> {t('qa')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/whats-new" className={({ isActive }) => isActive ? `${styles['nav-item']} ${styles['active']}` : styles['nav-item']}>
                                <span className={`material-symbols-outlined ${styles['nav-icon']}`}>new_releases</span> {t('whatsNew')}
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
        </aside>
    );
};
