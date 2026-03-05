import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import type { Vm } from '../../types/auth';
import styles from './Servers.module.css';

const statusColor = (status?: string) => {
    if (!status) return '#aaa';
    const s = status.toLowerCase();
    if (s === 'running') return '#10B981';
    if (s === 'stopped') return '#EF4444';
    return '#F59E0B';
};

export const Servers: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: vmsResponse, isLoading, isError } = useQuery({
        queryKey: ['vps'],
        queryFn: api.vps.getAll,
    });

    const vms: Vm[] = (vmsResponse?.data as Vm[] | undefined) ?? [];

    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const navigate = useNavigate();
    const { t } = useSettings();

    useEffect(() => {
        const handleClick = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const filteredVms = vms.filter(
        v => (v.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleActionClick = (e: React.MouseEvent, proxmoxId: number) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === proxmoxId ? null : proxmoxId);
    };

    const runVmAction = async (action: 'start' | 'stop' | 'restart' | 'shutdown', proxmox_id: number) => {
        setActionLoading(proxmox_id);
        try {
            await api.vps[action]({ proxmox_id });
            await queryClient.invalidateQueries({ queryKey: ['vps'] });
        } catch (err) {
            console.error(`Failed to ${action} VM`, err);
        } finally {
            setActionLoading(null);
            setOpenDropdownId(null);
        }
    };

    const handleDestroy = async (proxmox_id: number, name: string) => {
        const confirmText = t('servers.destroy_confirm').replace('{name}', name);
        if (!window.confirm(confirmText)) return;
        setActionLoading(proxmox_id);
        try {
            await api.vps.delete({ proxmox_id });
            await queryClient.invalidateQueries({ queryKey: ['vps'] });
        } catch (err) {
            console.error('Failed to delete VM', err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className={styles['page-container'] + " " + styles['servers-page']}>
            <div className={styles['page-header']}>
                <h1 className={styles['page-title']}>{t('servers.title')}</h1>
                <button className={styles['btn-primary']} onClick={() => navigate('/servers/create')}>
                    {t('servers.create_server')} <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            <div className={styles['search-container']}>
                <input
                    type="text"
                    className={styles['search-input']}
                    placeholder={t('servers.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading && <div style={{ padding: '20px' }}>{t('servers.loading')}</div>}
            {isError && <div style={{ padding: '20px', color: 'red' }}>{t('servers.load_error')}</div>}

            {!isLoading && !isError && (
                <div className={styles['table-container']}>
                    <table className={styles['data-table']}>
                        <thead>
                            <tr>
                                <th>{t('servers.table_name')}</th>
                                <th>{t('servers.table_status')}</th>
                                <th>IP</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence initial={false}>
                            {filteredVms.length === 0 ? (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>{t('servers.not_found')}</td></motion.tr>
                            ) : filteredVms.map((vm, i) => (
                                <motion.tr
                                    key={vm.proxmox_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                >
                                    <td>
                                        <div className={styles['server-name-cell']}>
                                            <div className={styles['server-icon-wrapper']}>
                                                <span className={`material-symbols-outlined ${styles['server-icon']}`}>dns</span>
                                            </div>
                                            <div onClick={() => navigate(`/servers/${vm.proxmox_id}`)} style={{ cursor: 'pointer' }}>
                                                <div className={styles['server-name']}>{vm.name ?? `VM-${vm.proxmox_id}`}</div>
                                                <div className={styles['server-characteristics']}>
                                                    {vm.configuration
                                                        ? `${vm.configuration.cores} CPU, ${vm.configuration.memory} MB RAM, ${vm.configuration.disk} GB`
                                                        : '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(vm.status) }} />
                                            {vm.status ?? '—'}
                                        </span>
                                    </td>
                                    <td>{vm.ip_address ?? '—'}</td>
                                    <td className={styles['actions-cell']} style={{ position: 'relative' }}>
                                        <button
                                            className={styles['btn-outline']}
                                            onClick={(e) => { e.stopPropagation(); navigate(`/servers/${vm.proxmox_id}/config`); }}
                                        >
                                            {t('servers.configuration')}
                                        </button>
                                        <button
                                            className={styles['btn-ghost']}
                                            onClick={(e) => handleActionClick(e, vm.proxmox_id)}
                                            disabled={actionLoading === vm.proxmox_id}
                                        >
                                            {actionLoading === vm.proxmox_id ? '...' : t('servers.more')} <span className="material-symbols-outlined">expand_more</span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                        {openDropdownId === vm.proxmox_id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className={styles['row-action-dropdown']}
                                            >
                                                <button onClick={() => runVmAction('start', vm.proxmox_id)}>{t('servers.action_start')}</button>
                                                <button onClick={() => runVmAction('stop', vm.proxmox_id)}>{t('servers.action_stop')}</button>
                                                <button onClick={() => runVmAction('restart', vm.proxmox_id)}>{t('servers.action_restart')}</button>
                                                <button onClick={() => runVmAction('shutdown', vm.proxmox_id)}>{t('servers.action_shutdown')}</button>
                                                <button className={styles['danger-text']} onClick={() => handleDestroy(vm.proxmox_id, vm.name ?? `VM-${vm.proxmox_id}`)}>{t('servers.destroy')}</button>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </td>
                                </motion.tr>
                            ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
