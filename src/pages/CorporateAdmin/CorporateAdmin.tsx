import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import styles from './CorporateAdmin.module.css';

interface Employee {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
    serverCount?: number;
}

interface CorpServer {
    id: string;
    name: string;
    ip: string;
    owner?: string;
    created: string;
    characteristics?: string;
}

type ActiveTab = 'employees' | 'servers';

export const CorporateAdmin: React.FC = () => {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<ActiveTab>('employees');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [servers, setServers] = useState<CorpServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [addError, setAddError] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [empRes, srvRes] = await Promise.all([
                api.corporate.getEmployees(),
                api.corporate.getAllCorpServers(),
            ]);
            setEmployees(empRes.data as Employee[]);
            setServers(srvRes.data as CorpServer[]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError('');
        if (!newUsername.trim() || !newEmail.trim()) {
            setAddError(t('corporate_admin.add_validation_error'));
            return;
        }
        try {
            const res = await api.corporate.addEmployee({ username: newUsername.trim(), email: newEmail.trim() });
            setEmployees(prev => [...prev, res.data as Employee]);
            setShowAddModal(false);
            setNewUsername('');
            setNewEmail('');
        } catch {
            setAddError(t('corporate_admin.add_error'));
        }
    };

    const handleRemoveEmployee = async (id: string) => {
        if (!window.confirm(t('corporate_admin.remove_confirm'))) return;
        await api.corporate.removeEmployee(id);
        setEmployees(prev => prev.filter(e => e.id !== id));
    };

    const totalServers = employees.reduce((sum, e) => sum + (e.serverCount ?? 0), 0);

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('corporate_admin.title')}</h1>
                <span className={styles.badge}>{t('corporate_admin.role_badge')}</span>
            </div>
            <p className={styles.subtitle}>{t('corporate_admin.subtitle')}</p>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{employees.length}</span>
                    <span className={styles.statLabel}>{t('corporate_admin.stat_employees')}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{servers.length}</span>
                    <span className={styles.statLabel}>{t('corporate_admin.stat_servers')}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{totalServers}</span>
                    <span className={styles.statLabel}>{t('corporate_admin.stat_total_servers')}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'employees' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('employees')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                    {t('corporate_admin.tab_employees')}
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'servers' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('servers')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dns</span>
                    {t('corporate_admin.tab_servers')}
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>hourglass_empty</span>
                    <p>{t('servers.loading')}</p>
                </div>
            ) : (
                <>
                    {/* Employees Tab */}
                    {activeTab === 'employees' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>{t('corporate_admin.employees_title')}</h2>
                                <button className={styles.btnPrimary} onClick={() => setShowAddModal(true)}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                                    {t('corporate_admin.add_employee')}
                                </button>
                            </div>

                            {employees.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <span className="material-symbols-outlined">group_off</span>
                                    </div>
                                    <p>{t('corporate_admin.no_employees')}</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>{t('corporate_admin.col_employee')}</th>
                                            <th>{t('corporate_admin.col_username')}</th>
                                            <th>{t('corporate_admin.col_servers')}</th>
                                            <th>{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map(emp => (
                                            <tr key={emp.id}>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <div className={styles.avatar}>
                                                            {(emp.firstName?.[0] ?? emp.username[0]).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className={styles.userName}>
                                                                {[emp.lastName, emp.firstName].filter(Boolean).join(' ') || emp.username}
                                                            </div>
                                                            <div className={styles.userEmail}>{emp.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{emp.username}</td>
                                                <td>
                                                    <span className={styles.serverCount}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>dns</span>
                                                        {emp.serverCount ?? 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionsCell}>
                                                        <button className={styles.btnDanger} onClick={() => handleRemoveEmployee(emp.id)}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_remove</span>
                                                            {t('corporate_admin.remove')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Servers Tab */}
                    {activeTab === 'servers' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>{t('corporate_admin.corp_servers_title')}</h2>
                            </div>

                            {servers.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <span className="material-symbols-outlined">dns</span>
                                    </div>
                                    <p>{t('servers.not_found')}</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>{t('servers.table_name')}</th>
                                            <th>{t('servers.table_ip')}</th>
                                            <th>{t('corporate_admin.col_owner')}</th>
                                            <th>{t('corporate_admin.col_characteristics')}</th>
                                            <th>{t('servers.table_created')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {servers.map(srv => (
                                            <tr key={srv.id}>
                                                <td>{srv.name}</td>
                                                <td><code>{srv.ip}</code></td>
                                                <td>{srv.owner ?? '—'}</td>
                                                <td>{srv.characteristics ?? '—'}</td>
                                                <td>{srv.created}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Add Employee Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className={styles.modalTitle}>{t('corporate_admin.modal_add_title')}</h3>
                            <form onSubmit={handleAddEmployee}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>{t('auth.username_placeholder')}</label>
                                    <input
                                        className={styles.formInput}
                                        type="text"
                                        value={newUsername}
                                        onChange={e => setNewUsername(e.target.value)}
                                        placeholder="username"
                                        autoFocus
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>{t('settings.email')}</label>
                                    <input
                                        className={styles.formInput}
                                        type="email"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        placeholder="email@corp.by"
                                    />
                                </div>
                                {addError && (
                                    <p style={{ color: 'var(--c-bright-red)', fontSize: '13px', margin: '0 0 8px' }}>{addError}</p>
                                )}
                                <div className={styles.modalActions}>
                                    <button type="button" className={styles.btnCancel} onClick={() => setShowAddModal(false)}>
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className={styles.btnPrimary}>
                                        {t('corporate_admin.add_employee')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
