import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import type { Corporation, User } from '../../types/auth';
import styles from './CorporateAdmin.module.css';

type ActiveTab = 'corporations' | 'members';

export const CorporateAdmin: React.FC = () => {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<ActiveTab>('corporations');
    const [corporations, setCorporations] = useState<Corporation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCorpName, setNewCorpName] = useState('');
    const [createError, setCreateError] = useState('');

    // Member management
    const [selectedCorp, setSelectedCorp] = useState<Corporation | null>(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMemberUserId, setNewMemberUserId] = useState('');
    const [memberError, setMemberError] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.corporations.getAll();
            setCorporations(res.data as Corporation[]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateCorporation = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');
        if (!newCorpName.trim()) {
            setCreateError(t('corporate_admin.add_validation_error'));
            return;
        }
        try {
            const res = await api.corporations.create({ name: newCorpName.trim() });
            setCorporations(prev => [...prev, res.data as Corporation]);
            setShowCreateModal(false);
            setNewCorpName('');
        } catch {
            setCreateError(t('corporate_admin.add_error'));
        }
    };

    const handleDeleteCorporation = async (id: string) => {
        if (!window.confirm(t('corporate_admin.delete_corp_confirm'))) return;
        try {
            await api.corporations.delete(id);
            setCorporations(prev => prev.filter(c => c.id !== id));
            if (selectedCorp?.id === id) setSelectedCorp(null);
        } catch (err) {
            console.error('Failed to delete corporation', err);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setMemberError('');
        if (!selectedCorp || !newMemberUserId.trim()) {
            setMemberError(t('corporate_admin.add_validation_error'));
            return;
        }
        try {
            await api.corporations.addMember(selectedCorp.id, newMemberUserId.trim());
            // Refresh corp details
            const res = await api.corporations.getById(selectedCorp.id);
            const updated = res.data as Corporation;
            setCorporations(prev => prev.map(c => c.id === updated.id ? updated : c));
            setSelectedCorp(updated);
            setShowAddMemberModal(false);
            setNewMemberUserId('');
        } catch {
            setMemberError(t('corporate_admin.add_error'));
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!selectedCorp) return;
        if (!window.confirm(t('corporate_admin.remove_confirm'))) return;
        try {
            await api.corporations.removeMember(selectedCorp.id, userId);
            const res = await api.corporations.getById(selectedCorp.id);
            const updated = res.data as Corporation;
            setCorporations(prev => prev.map(c => c.id === updated.id ? updated : c));
            setSelectedCorp(updated);
        } catch (err) {
            console.error('Failed to remove member', err);
        }
    };

    const getMemberDisplayName = (member: User) => {
        const name = [member.firstName, member.lastName].filter(Boolean).join(' ');
        return name || member.username || member.id;
    };

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
                    <span className={styles.statValue}>{corporations.length}</span>
                    <span className={styles.statLabel}>{t('corporate_admin.stat_corporations')}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{corporations.reduce((s, c) => s + (c.members?.length ?? 0), 0)}</span>
                    <span className={styles.statLabel}>{t('corporate_admin.stat_members')}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'corporations' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('corporations')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>corporate_fare</span>
                    {t('corporate_admin.tab_corporations')}
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'members' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                    {t('corporate_admin.tab_members')}
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>hourglass_empty</span>
                    <p>{t('servers.loading')}</p>
                </div>
            ) : (
                <>
                    {/* Corporations Tab */}
                    {activeTab === 'corporations' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>{t('corporate_admin.corporations_title')}</h2>
                                <button className={styles.btnPrimary} onClick={() => setShowCreateModal(true)}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                                    {t('corporate_admin.create_corporation')}
                                </button>
                            </div>

                            {corporations.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <span className="material-symbols-outlined">corporate_fare</span>
                                    </div>
                                    <p>{t('corporate_admin.no_corporations')}</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>{t('corporate_admin.col_corp_name')}</th>
                                            <th>{t('corporate_admin.col_members_count')}</th>
                                            <th>{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {corporations.map(corp => (
                                            <tr key={corp.id}>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <div className={styles.avatar}>
                                                            {corp.name[0]?.toUpperCase() ?? '?'}
                                                        </div>
                                                        <div className={styles.userName}>{corp.name}</div>
                                                    </div>
                                                </td>
                                                <td>{corp.members?.length ?? 0}</td>
                                                <td>
                                                    <div className={styles.actionsCell}>
                                                        <button className={styles.btnSecondary} onClick={() => { setSelectedCorp(corp); setActiveTab('members'); }}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>group</span>
                                                            {t('corporate_admin.tab_members')}
                                                        </button>
                                                        <button className={styles.btnDanger} onClick={() => handleDeleteCorporation(corp.id)}>
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

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <h2 className={styles.sectionTitle}>{t('corporate_admin.members_title')}</h2>
                                    {corporations.length > 0 && (
                                        <select
                                            value={selectedCorp?.id ?? ''}
                                            onChange={e => setSelectedCorp(corporations.find(c => c.id === e.target.value) ?? null)}
                                            className={styles.formInput}
                                            style={{ width: 'auto', minWidth: 200 }}
                                        >
                                            <option value="">{t('corporate_admin.select_corporation')}</option>
                                            {corporations.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                {selectedCorp && (
                                    <button className={styles.btnPrimary} onClick={() => setShowAddMemberModal(true)}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                                        {t('corporate_admin.add_member')}
                                    </button>
                                )}
                            </div>

                            {!selectedCorp ? (
                                <div className={styles.emptyState}>
                                    <p>{t('corporate_admin.select_corporation')}</p>
                                </div>
                            ) : (selectedCorp.members?.length ?? 0) === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <span className="material-symbols-outlined">group_off</span>
                                    </div>
                                    <p>{t('corporate_admin.no_members')}</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>{t('corporate_admin.col_member')}</th>
                                            <th>{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedCorp.members!.map(member => (
                                            <tr key={member.id}>
                                                <td>
                                                    <div className={styles.userCell}>
                                                        <div className={styles.avatar}>
                                                            {(member.firstName?.[0] ?? member.username?.[0] ?? '?').toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className={styles.userName}>{getMemberDisplayName(member)}</div>
                                                            <div className={styles.userEmail}>{member.email ?? member.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button className={styles.btnDanger} onClick={() => handleRemoveMember(String(member.id ?? ''))}>  
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_remove</span>
                                                        {t('corporate_admin.remove')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Create Corporation Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className={styles.modalTitle}>{t('corporate_admin.create_corporation')}</h3>
                            <form onSubmit={handleCreateCorporation}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>{t('corporate_admin.corp_name_label')}</label>
                                    <input
                                        className={styles.formInput}
                                        type="text"
                                        value={newCorpName}
                                        onChange={e => setNewCorpName(e.target.value)}
                                        placeholder={t('corporate_admin.corp_name_placeholder')}
                                        autoFocus
                                    />
                                </div>
                                {createError && (
                                    <p style={{ color: 'var(--c-bright-red)', fontSize: '13px', margin: '0 0 8px' }}>{createError}</p>
                                )}
                                <div className={styles.modalActions}>
                                    <button type="button" className={styles.btnCancel} onClick={() => setShowCreateModal(false)}>
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className={styles.btnPrimary}>
                                        {t('corporate_admin.create_corporation')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Member Modal */}
            <AnimatePresence>
                {showAddMemberModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowAddMemberModal(false); }}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h3 className={styles.modalTitle}>{t('corporate_admin.add_member')}</h3>
                            <form onSubmit={handleAddMember}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>{t('corporate_admin.col_member_id')}</label>
                                    <input
                                        className={styles.formInput}
                                        type="text"
                                        value={newMemberUserId}
                                        onChange={e => setNewMemberUserId(e.target.value)}
                                        placeholder="user-uuid"
                                        autoFocus
                                    />
                                </div>
                                {memberError && (
                                    <p style={{ color: 'var(--c-bright-red)', fontSize: '13px', margin: '0 0 8px' }}>{memberError}</p>
                                )}
                                <div className={styles.modalActions}>
                                    <button type="button" className={styles.btnCancel} onClick={() => setShowAddMemberModal(false)}>
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className={styles.btnPrimary}>
                                        {t('corporate_admin.add_member')}
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
