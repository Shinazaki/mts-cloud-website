import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import type { UserRole } from '../../types/auth';
import styles from './SuperAdmin.module.css';

interface AdminUser {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
    serverCount?: number;
}

interface AdminServer {
    id: string;
    name: string;
    ip: string;
    owner?: string;
    role?: string;
    created: string;
}

type ActiveTab = 'users' | 'servers';

const ROLE_LABELS: Record<string, string> = {
    'user': 'user',
    'admin-corporate': 'corporate',
    'admin': 'admin',
};

export const SuperAdmin: React.FC = () => {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<ActiveTab>('users');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [servers, setServers] = useState<AdminServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Role edit modal
    const [editUser, setEditUser] = useState<AdminUser | null>(null);
    const [editRole, setEditRole] = useState<string>('user');

    // User servers drawer
    const [viewUser, setViewUser] = useState<AdminUser | null>(null);
    const [userServers, setUserServers] = useState<AdminServer[]>([]);
    const [loadingUserServers, setLoadingUserServers] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersRes, serversRes] = await Promise.all([
                api.admin.getAllUsers(),
                api.admin.getAllServers(),
            ]);
            setUsers(usersRes.data as AdminUser[]);
            setServers(serversRes.data as AdminServer[]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm(t('super_admin.delete_user_confirm'))) return;
        await api.admin.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    const openEditRole = (user: AdminUser) => {
        setEditUser(user);
        setEditRole(user.role);
    };

    const handleSaveRole = async () => {
        if (!editUser) return;
        await api.admin.updateUserRole(editUser.id, editRole);
        setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, role: editRole } : u));
        setEditUser(null);
    };

    const openUserServers = async (user: AdminUser) => {
        setViewUser(user);
        setLoadingUserServers(true);
        try {
            const res = await api.admin.getUserServers(user.id);
            setUserServers(res.data as AdminServer[]);
        } finally {
            setLoadingUserServers(false);
        }
    };

    const getRoleBadgeClass = (role: string) => {
        if (role === 'admin') return `${styles.roleBadge} ${styles.roleAdmin}`;
        if (role === 'admin-corporate') return `${styles.roleBadge} ${styles.roleCorp}`;
        return `${styles.roleBadge} ${styles.roleUser}`;
    };

    const getAvatarClass = (role: string) => {
        if (role === 'admin') return `${styles.avatarUser} ${styles.avatarAdmin}`;
        if (role === 'admin-corporate') return `${styles.avatarUser} ${styles.avatarCorp}`;
        return styles.avatarUser;
    };

    const filteredUsers = users.filter(u =>
        !search ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.firstName ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (u.lastName ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredServers = servers.filter(s =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.ip.includes(search) ||
        (s.owner ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const totalCorp = users.filter(u => u.role === 'admin-corporate').length;

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('super_admin.title')}</h1>
                <span className={styles.badgeAdmin}>{t('super_admin.role_badge')}</span>
            </div>
            <p className={styles.subtitle}>{t('super_admin.subtitle')}</p>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{users.length}</span>
                    <span className={styles.statLabel}>{t('super_admin.stat_users')}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{totalCorp}</span>
                    <span className={styles.statLabel}>{t('super_admin.stat_corp_admins')}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{totalAdmins}</span>
                    <span className={styles.statLabel}>{t('super_admin.stat_admins')}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{servers.length}</span>
                    <span className={styles.statLabel}>{t('super_admin.stat_servers')}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabActive : ''}`}
                    onClick={() => { setActiveTab('users'); setSearch(''); }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>manage_accounts</span>
                    {t('super_admin.tab_users')}
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'servers' ? styles.tabActive : ''}`}
                    onClick={() => { setActiveTab('servers'); setSearch(''); }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dns</span>
                    {t('super_admin.tab_servers')}
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>hourglass_empty</span>
                    <p>{t('servers.loading')}</p>
                </div>
            ) : (
                <>
                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>{t('super_admin.users_title')}</h2>
                                <input
                                    className={styles.searchInput}
                                    type="text"
                                    placeholder={t('super_admin.search_users')}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            {filteredUsers.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>{t('servers.not_found')}</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>{t('super_admin.col_user')}</th>
                                            <th>{t('super_admin.col_username')}</th>
                                            <th>{t('super_admin.col_role')}</th>
                                            <th>{t('corporate_admin.col_servers')}</th>
                                            <th>{t('super_admin.col_actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <div className={getAvatarClass(user.role)}>
                                                            {(user.firstName?.[0] ?? user.username[0]).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className={styles.userName}>
                                                                {[user.lastName, user.firstName].filter(Boolean).join(' ') || user.username}
                                                            </div>
                                                            <div className={styles.userEmail}>{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{user.username}</td>
                                                <td>
                                                    <span className={getRoleBadgeClass(user.role)}>
                                                        {ROLE_LABELS[user.role] ?? user.role}
                                                    </span>
                                                </td>
                                                <td>{user.serverCount ?? 0}</td>
                                                <td>
                                                    <div className={styles.actionsCell}>
                                                        <button className={styles.btnSecondary} onClick={() => openUserServers(user)}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>dns</span>
                                                            {t('super_admin.view_servers')}
                                                        </button>
                                                        <button className={styles.btnPurple} onClick={() => openEditRole(user)}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>manage_accounts</span>
                                                            {t('super_admin.change_role')}
                                                        </button>
                                                        <button className={styles.btnDanger} onClick={() => handleDeleteUser(user.id)}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                                                            {t('common.delete')}
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
                                <h2 className={styles.sectionTitle}>{t('super_admin.all_servers_title')}</h2>
                                <input
                                    className={styles.searchInput}
                                    type="text"
                                    placeholder={t('servers.search_placeholder')}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            {filteredServers.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>{t('servers.not_found')}</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>{t('servers.table_name')}</th>
                                            <th>{t('servers.table_ip')}</th>
                                            <th>{t('corporate_admin.col_owner')}</th>
                                            <th>{t('super_admin.col_role')}</th>
                                            <th>{t('servers.table_created')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredServers.map(srv => (
                                            <tr key={srv.id}>
                                                <td>{srv.name}</td>
                                                <td><code>{srv.ip}</code></td>
                                                <td>{srv.owner ?? '—'}</td>
                                                <td>
                                                    {srv.role && (
                                                        <span className={getRoleBadgeClass(srv.role)}>
                                                            {ROLE_LABELS[srv.role] ?? srv.role}
                                                        </span>
                                                    )}
                                                </td>
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

            {/* Change Role Modal */}
            <AnimatePresence>
                {editUser && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget) setEditUser(null); }}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className={styles.modalTitle}>{t('super_admin.modal_role_title')}</h3>
                            <p className={styles.modalSubtitle}>
                                {t('super_admin.modal_role_subtitle')}: <strong>{editUser.username}</strong>
                            </p>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>{t('super_admin.col_role')}</label>
                                <select
                                    className={styles.formSelect}
                                    value={editRole}
                                    onChange={e => setEditRole(e.target.value as UserRole)}
                                >
                                    <option value="user">user</option>
                                    <option value="admin-corporate">admin-corporate</option>
                                    <option value="admin">admin</option>
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button className={styles.btnCancel} onClick={() => setEditUser(null)}>
                                    {t('common.cancel')}
                                </button>
                                <button className={styles.btnPrimary} onClick={handleSaveRole}>
                                    {t('common.save')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View User Servers Modal */}
            <AnimatePresence>
                {viewUser && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget) setViewUser(null); }}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className={styles.modalTitle}>{t('super_admin.modal_servers_title')}</h3>
                            <p className={styles.modalSubtitle}>{viewUser.username}</p>
                            {loadingUserServers ? (
                                <p style={{ textAlign: 'center', color: 'var(--c-gray-500)' }}>{t('servers.loading')}</p>
                            ) : userServers.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--c-gray-500)' }}>{t('servers.not_found')}</p>
                            ) : (
                                <table className={styles.serverTable}>
                                    <thead>
                                        <tr>
                                            <th>{t('servers.table_name')}</th>
                                            <th>{t('servers.table_ip')}</th>
                                            <th>{t('servers.table_created')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userServers.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.name}</td>
                                                <td><code>{s.ip}</code></td>
                                                <td>{s.created}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div className={styles.modalActions}>
                                <button className={styles.btnCancel} onClick={() => setViewUser(null)}>
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
