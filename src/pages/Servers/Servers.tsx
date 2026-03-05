import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
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
        queryFn: api.vps.getMy,
    });

    const vms: Vm[] = (vmsResponse?.data as Vm[] | undefined) ?? [];

    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useSettings();
    const { user } = useAuth();

    const isAdmin = user?.roles?.some(r => r.role === 'admin') ?? user?.role === 'admin';

    const running = vms.filter(v => (v.status ?? '').toLowerCase() === 'running').length;
    const stopped = vms.filter(v => (v.status ?? '').toLowerCase() === 'stopped').length;

    // Format balance: may arrive as "$0.00" or number
    const rawBalance = user?.balance;
    const balanceDisplay = rawBalance != null
        ? (typeof rawBalance === 'string' ? rawBalance : `$${Number(rawBalance).toFixed(2)}`)
        : '—';

    // ── CountUp animation ──────────────────────────────────────
    const CountUp: React.FC<{ target: number; duration?: number }> = ({ target, duration = 800 }) => {
        const [val, setVal] = useState(0);
        useEffect(() => {
            if (target === 0) { setVal(0); return; }
            let cur = 0;
            const steps = 24;
            const inc = target / steps;
            const id = setInterval(() => {
                cur = Math.min(cur + inc, target);
                setVal(Math.round(cur));
                if (cur >= target) clearInterval(id);
            }, duration / steps);
            return () => clearInterval(id);
        }, [target, duration]);
        return <>{val}</>;
    };

    // ── Donut arc chart (SVG) ──────────────────────────────────
    const DonutArc: React.FC<{ total: number; running: number }> = ({ total, running: r }) => {
        const radius = 22;
        const C = 2 * Math.PI * radius;
        const pct = total > 0 ? r / total : 0;
        return (
            <svg width={54} height={54} viewBox="-27 -27 54 54"
                style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                <circle r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={5} />
                <motion.circle
                    r={radius} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${C}` }}
                    animate={{ strokeDasharray: `${pct * C} ${C}` }}
                    transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
                />
                {r === 0 && total > 0 && (
                    <circle r={radius} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={5} />
                )}
            </svg>
        );
    };

    useEffect(() => {
        const handleClick = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const filteredVms = vms.filter(
        v => (v.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleActionClick = (e: React.MouseEvent, vmId: string) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === vmId ? null : vmId);
    };

    const runVmAction = async (action: 'start' | 'stop' | 'restart' | 'shutdown', id: string) => {
        setActionLoading(id);
        try {
            await api.vps[action]({ id });
            await queryClient.invalidateQueries({ queryKey: ['vps'] });
        } catch (err) {
            console.error(`Failed to ${action} VM`, err);
        } finally {
            setActionLoading(null);
            setOpenDropdownId(null);
        }
    };

    const handleDestroy = async (vm: Vm) => {
        const confirmText = t('servers.destroy_confirm').replace('{name}', vm.name ?? `VM-${vm.proxmox_id}`);
        if (!window.confirm(confirmText)) return;
        setActionLoading(vm.id);
        try {
            await api.vps.delete({ proxmox_id: vm.proxmox_id ?? 0 });
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

            {/* ── Admin Panel Card (visible only to users with admin role) ── */}
            <AnimatePresence>
                {isAdmin && (
                    <motion.div
                        className={styles['admin-banner']}
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        onClick={() => navigate('/admin')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && navigate('/admin')}
                    >
                        <span className={`material-symbols-outlined ${styles['admin-banner-icon']}`}>
                            admin_panel_settings
                        </span>
                        <div className={styles['admin-banner-text']}>
                            <strong>{t('servers.admin_card_title')}</strong>
                            <span>{t('servers.admin_card_desc')}</span>
                        </div>
                        <span className={`material-symbols-outlined ${styles['admin-banner-arrow']}`}>
                            arrow_forward
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Stats strip ─────────────────────────────────────────── */}
            <div className={styles['stats-strip']}>
                {/* Card 1: Total VMs */}
                <motion.div
                    className={`${styles['stat-card']} ${styles['stat-blue']}`}
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0 }}
                >
                    <div className={styles['stat-card-top']}>
                        <span className={`material-symbols-outlined ${styles['stat-icon']}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}>dns</span>
                        {!isLoading && <DonutArc total={vms.length} running={running} />}
                        {isLoading && <div className={styles['stat-donut-placeholder']} />}
                    </div>
                    <div className={styles['stat-num']}>
                        {isLoading ? <span className={styles['stat-skeleton']}>—</span>
                            : <CountUp target={vms.length} />}
                    </div>
                    <div className={styles['stat-lbl']}>{t('servers.stat_total')}</div>
                </motion.div>

                {/* Card 2: Running */}
                <motion.div
                    className={`${styles['stat-card']} ${styles['stat-green']}`}
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className={styles['stat-card-top']}>
                        <span className={`material-symbols-outlined ${styles['stat-icon']}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {!isLoading && running > 0 && (
                            <span className={styles['pulse-ring-wrapper']}>
                                <span className={styles['pulse-ring']} />
                                <span className={styles['pulse-dot']} />
                            </span>
                        )}
                    </div>
                    <div className={styles['stat-num']}>
                        {isLoading ? <span className={styles['stat-skeleton']}>—</span>
                            : <CountUp target={running} />}
                    </div>
                    <div className={styles['stat-lbl']}>{t('servers.stat_running')}</div>
                    {!isLoading && vms.length > 0 && (
                        <div className={styles['stat-bar-row']}>
                            <div className={styles['stat-bar-bg']}>
                                <motion.div
                                    className={styles['stat-bar-fill-green']}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(running / vms.length) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.4 }}
                                />
                            </div>
                            <span className={styles['stat-bar-pct']}>
                                {Math.round((running / vms.length) * 100)}%
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Card 3: Stopped */}
                <motion.div
                    className={`${styles['stat-card']} ${styles['stat-amber']}`}
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className={styles['stat-card-top']}>
                        <span className={`material-symbols-outlined ${styles['stat-icon']}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}>stop_circle</span>
                    </div>
                    <div className={styles['stat-num']}>
                        {isLoading ? <span className={styles['stat-skeleton']}>—</span>
                            : <CountUp target={stopped} />}
                    </div>
                    <div className={styles['stat-lbl']}>{t('servers.stat_stopped')}</div>
                    {!isLoading && vms.length > 0 && (
                        <div className={styles['stat-bar-row']}>
                            <div className={styles['stat-bar-bg']}>
                                <motion.div
                                    className={styles['stat-bar-fill-amber']}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stopped / vms.length) * 100}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                            <span className={styles['stat-bar-pct']}>
                                {Math.round((stopped / vms.length) * 100)}%
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Card 4: Balance */}
                <motion.div
                    className={`${styles['stat-card']} ${styles['stat-purple']}`}
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/billing')}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate('/billing')}
                >
                    <div className={styles['stat-card-top']}>
                        <span className={`material-symbols-outlined ${styles['stat-icon']}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                        <span className={styles['stat-badge']}>BYN</span>
                    </div>
                    <div className={styles['stat-num']} style={{ fontSize: '1.8rem' }}>
                        {balanceDisplay}
                    </div>
                    <div className={styles['stat-lbl']}>{t('servers.stat_balance')}</div>
                    <div className={styles['stat-topup']}>
                        {t('servers.stat_topup')}
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                    </div>
                </motion.div>
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
                                    key={vm.id}
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
                                            <div onClick={() => navigate(`/servers/${vm.id}`)} style={{ cursor: 'pointer' }}>
                                                <div className={styles['server-name']}>{vm.name ?? `VM-${vm.proxmox_id}`}</div>
                                                <div className={styles['server-characteristics']}>
                                                    {vm.configuration
                                                        ? `${vm.configuration.cpu} CPU, ${vm.configuration.ram} MB RAM, ${vm.configuration.ssd} GB`
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
                                            onClick={(e) => { e.stopPropagation(); navigate(`/servers/${vm.id}/config`); }}
                                        >
                                            {t('servers.configuration')}
                                        </button>
                                        <button
                                            className={styles['btn-ghost']}
                                            onClick={(e) => handleActionClick(e, vm.id)}
                                            disabled={actionLoading === vm.id}
                                        >
                                            {actionLoading === vm.id ? '...' : t('servers.more')} <span className="material-symbols-outlined">expand_more</span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                        {openDropdownId === vm.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className={styles['row-action-dropdown']}
                                            >
                                                <button onClick={() => runVmAction('start', vm.id)}>{t('servers.action_start')}</button>
                                                <button onClick={() => runVmAction('stop', vm.id)}>{t('servers.action_stop')}</button>
                                                <button onClick={() => runVmAction('restart', vm.id)}>{t('servers.action_restart')}</button>
                                                <button onClick={() => runVmAction('shutdown', vm.id)}>{t('servers.action_shutdown')}</button>
                                                <button className={styles['danger-text']} onClick={() => handleDestroy(vm)}>{t('servers.destroy')}</button>
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
