import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const navigate = useNavigate();
    const { t } = useSettings();

    // Mock list of servers to display in projects dropdown
    const mockServers = [
        { id: '1', name: 'WebProd-Node-01' },
        { id: '2', name: 'Database-Primary' }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <span className="material-symbols-outlined logo-icon">cloud</span>
                <span className="logo-text">MTC Cloud</span>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <button
                        className="nav-section-title"
                        onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                    >
                        {t('projects')}
                        <span className="material-symbols-outlined" style={{ transform: isProjectsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                            expand_more
                        </span>
                    </button>

                    {isProjectsOpen && (
                        <ul className="projects-dropdown" style={{ listStyle: 'none', padding: '0', margin: '8px 0 16px 0' }}>
                            {mockServers.map(server => (
                                <li key={server.id} style={{ padding: '8px 16px', fontSize: '14px', color: 'var(--c-white)', cursor: 'pointer' }} onClick={() => navigate(`/servers/${server.id}`)}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '8px' }}>dns</span>
                                    {server.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="nav-section">
                    <button className="nav-section-title active-section">
                        {t('management')} <span className="material-symbols-outlined">expand_less</span>
                    </button>
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/servers" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">dns</span> {t('servers')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/backups" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">cloud_sync</span> {t('backups')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/monitoring" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">monitoring</span> {t('monitoring')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/traffic" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">swap_horiz</span> {t('traffic')}
                            </NavLink>
                        </li>
                    </ul>
                </div>

                <div className="nav-divider"></div>

                <div className="nav-section bottom-section">
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/billing" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">payments</span> {t('billing')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/support" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">support_agent</span> {t('support')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">settings</span> {t('settings')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/api" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">api</span> {t('api')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/qa" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">help_center</span> {t('qa')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/whats-new" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                                <span className="material-symbols-outlined nav-icon">new_releases</span> {t('whatsNew')}
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>
        </aside>
    );
};
