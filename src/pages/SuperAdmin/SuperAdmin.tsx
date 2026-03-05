import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import type { UserRole } from '../../types/auth';
import styles from './SuperAdmin.module.css';

// ── Types ────────────────────────────────────────────────────
interface AdminUser {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
}
interface ProxmoxVm { vmid?: number; proxmox_id?: number; name?: string; status?: string; node?: string; maxmem?: number; maxdisk?: number; uptime?: number; [k: string]: unknown; }
interface LxcContainer { vmid?: number; proxmox_id?: number; name?: string; hostname?: string; status?: string; node?: string; maxmem?: number; [k: string]: unknown; }
interface StorageItem { storage?: string; type?: string; content?: string; avail?: number; total?: number; used?: number; [k: string]: unknown; }
interface Pool { poolid?: string; comment?: string; [k: string]: unknown; }
interface RbacRole { roleid?: string; privs?: string; [k: string]: unknown; }
interface RbacPveUser { userid?: string; email?: string; groups?: string; enable?: number; [k: string]: unknown; }
interface SdnZone { zone?: string; type?: string; nodes?: string; [k: string]: unknown; }
interface SdnVnet { vnet?: string; zone?: string; tag?: number; [k: string]: unknown; }
interface DbVm { id: number | string; name?: string; proxmox_id?: number; status?: string; [k: string]: unknown; }
interface RrdPoint { time?: number; cpu?: number; mem?: number; maxmem?: number; netin?: number; netout?: number; diskread?: number; diskwrite?: number; [k: string]: unknown; }

type ActiveTab = 'users' | 'vms' | 'lxc' | 'rbac' | 'storage' | 'pools' | 'sdn' | 'monitoring';
type RbacSubTab = 'roles' | 'pveusers';

const ROLE_LABELS: Record<string, string> = {
    'user': 'user',
    'admin-corporation': 'admin-corporation',
    'admin': 'admin',
};

const fmt = (bytes: number) => { if (!bytes) return '-'; const g = bytes / (1024 ** 3); return g >= 1 ? `${g.toFixed(1)} GB` : `${(bytes / (1024 ** 2)).toFixed(0)} MB`; };
const fmtUp = (s: number) => { if (!s) return '-'; const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60); if (d > 0) return `${d}d ${h}h`; if (h > 0) return `${h}h ${m}m`; return `${m}m`; };
const StatusBadge = ({ status }: { status?: string }) => { const s = (status ?? '').toLowerCase(); if (s === 'running') return <span style={{ color: '#2e7d32', fontWeight: 600 }}>● running</span>; if (s === 'stopped') return <span style={{ color: '#c62828', fontWeight: 600 }}>● stopped</span>; return <span style={{ color: '#757575' }}>{status ?? '-'}</span>; };

export const SuperAdmin: React.FC = () => {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<ActiveTab>('users');
    const [search, setSearch] = useState('');

    // Users
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [editUser, setEditUser] = useState<AdminUser | null>(null);
    const [editRole, setEditRole] = useState<string>('user');

    // VMs
    const [vms, setVms] = useState<ProxmoxVm[]>([]);
    const [vmsLoading, setVmsLoading] = useState(false);
    const [vmsLoaded, setVmsLoaded] = useState(false);

    // LXC
    const [lxcList, setLxcList] = useState<LxcContainer[]>([]);
    const [lxcLoading, setLxcLoading] = useState(false);
    const [lxcLoaded, setLxcLoaded] = useState(false);
    const [lxcAction, setLxcAction] = useState<string | null>(null);

    // Storage
    const [storageList, setStorageList] = useState<StorageItem[]>([]);
    const [storageLoading, setStorageLoading] = useState(false);
    const [storageLoaded, setStorageLoaded] = useState(false);

    // Pools
    const [pools, setPools] = useState<Pool[]>([]);
    const [poolsLoading, setPoolsLoading] = useState(false);
    const [poolsLoaded, setPoolsLoaded] = useState(false);

    // RBAC
    const [rbacSubTab, setRbacSubTab] = useState<RbacSubTab>('roles');
    const [rbacRoles, setRbacRoles] = useState<RbacRole[]>([]);
    const [rbacUsers, setRbacUsers] = useState<RbacPveUser[]>([]);
    const [rbacLoading, setRbacLoading] = useState(false);
    const [rbacLoaded, setRbacLoaded] = useState(false);

    // SDN
    const [sdnZones, setSdnZones] = useState<SdnZone[]>([]);
    const [sdnVnets, setSdnVnets] = useState<SdnVnet[]>([]);
    const [sdnLoading, setSdnLoading] = useState(false);
    const [sdnLoaded, setSdnLoaded] = useState(false);

    // Monitoring
    const [monType, setMonType] = useState<'vm' | 'lxc'>('vm');
    const [monSelectedId, setMonSelectedId] = useState<string>('');
    const [monData, setMonData] = useState<RrdPoint[] | null>(null);
    const [monLoading, setMonLoading] = useState(false);
    const [dbVms, setDbVms] = useState<DbVm[]>([]);
    const [dbVmsLoaded, setDbVmsLoaded] = useState(false);

    // Load users on mount
    useEffect(() => {
        (async () => {
            setUsersLoading(true);
            try { const r = await api.users.getAll(); setUsers(r.data as AdminUser[]); }
            finally { setUsersLoading(false); }
        })();
    }, []);

    // Lazy-load per tab
    useEffect(() => {
        const arr = <T,>(v: unknown): T[] => Array.isArray(v) ? v as T[] : ((v as { data?: T[] })?.data ?? []);
        if (activeTab === 'vms' && !vmsLoaded) {
            setVmsLoading(true);
            api.vps.getAdminProxmoxVms().then(r => { setVms(arr<ProxmoxVm>(r.data)); setVmsLoaded(true); }).catch(() => setVms([])).finally(() => setVmsLoading(false));
        }
        if (activeTab === 'lxc' && !lxcLoaded) {
            setLxcLoading(true);
            api.lxc.listAll().then(r => { setLxcList(arr<LxcContainer>(r.data)); setLxcLoaded(true); }).catch(() => setLxcList([])).finally(() => setLxcLoading(false));
        }
        if (activeTab === 'storage' && !storageLoaded) {
            setStorageLoading(true);
            api.storage.listGlobal().then(r => { setStorageList(arr<StorageItem>(r.data)); setStorageLoaded(true); }).catch(() => setStorageList([])).finally(() => setStorageLoading(false));
        }
        if (activeTab === 'pools' && !poolsLoaded) {
            setPoolsLoading(true);
            api.pools.list().then(r => { setPools(arr<Pool>(r.data)); setPoolsLoaded(true); }).catch(() => setPools([])).finally(() => setPoolsLoading(false));
        }
        if (activeTab === 'rbac' && !rbacLoaded) {
            setRbacLoading(true);
            Promise.all([api.rbac.listRoles(), api.rbac.listUsers()])
                .then(([rr, ur]) => { setRbacRoles(arr<RbacRole>(rr.data)); setRbacUsers(arr<RbacPveUser>(ur.data)); setRbacLoaded(true); })
                .catch(() => { setRbacRoles([]); setRbacUsers([]); })
                .finally(() => setRbacLoading(false));
        }
        if (activeTab === 'sdn' && !sdnLoaded) {
            setSdnLoading(true);
            Promise.all([api.sdn.listZones(), api.sdn.listVnets()])
                .then(([zr, vr]) => { setSdnZones(arr<SdnZone>(zr.data)); setSdnVnets(arr<SdnVnet>(vr.data)); setSdnLoaded(true); })
                .catch(() => { setSdnZones([]); setSdnVnets([]); })
                .finally(() => setSdnLoading(false));
        }
        if (activeTab === 'monitoring') {
            if (!dbVmsLoaded) {
                api.vps.getAll().then(r => { setDbVms(arr<DbVm>(r.data)); setDbVmsLoaded(true); }).catch(() => setDbVms([]));
            }
            if (!lxcLoaded) {
                setLxcLoading(true);
                api.lxc.listAll().then(r => { setLxcList(arr<LxcContainer>(r.data)); setLxcLoaded(true); }).catch(() => setLxcList([])).finally(() => setLxcLoading(false));
            }
        }
    }, [activeTab, vmsLoaded, lxcLoaded, storageLoaded, poolsLoaded, rbacLoaded, sdnLoaded, dbVmsLoaded]);

    const getRoleBadgeClass = (role: string) => {
        if (role === 'admin') return `${styles.roleBadge} ${styles.roleAdmin}`;
        if (role === 'admin-corporation') return `${styles.roleBadge} ${styles.roleCorp}`;
        return `${styles.roleBadge} ${styles.roleUser}`;
    };
    const getAvatarClass = (role: string) => {
        if (role === 'admin') return `${styles.avatarUser} ${styles.avatarAdmin}`;
        if (role === 'admin-corporation') return `${styles.avatarUser} ${styles.avatarCorp}`;
        return styles.avatarUser;
    };

    const openEditRole = (user: AdminUser) => { setEditUser(user); setEditRole(user.role); };
    const handleSaveRole = async () => {
        if (!editUser) return;
        try {
            await api.users.assignRoles(editUser.id, { roles: [editRole] });
            setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, role: editRole } : u));
        } catch (err) {
            console.error('Failed to assign role', err);
        }
        setEditUser(null);
    };

    const handleLxcAction = async (action: 'start' | 'stop' | 'shutdown' | 'reboot', id: number) => {
        const key = `${action}-${id}`;
        setLxcAction(key);
        try {
            await api.lxc[action](id);
            const r = await api.lxc.listAll();
            const arr2 = Array.isArray(r.data) ? r.data : (r.data as { data?: LxcContainer[] })?.data ?? [];
            setLxcList(arr2 as LxcContainer[]);
        } catch (e) { console.error(e); }
        finally { setLxcAction(null); }
    };

    const filteredUsers = users.filter(u => !search || u.username.toLowerCase().includes(search.toLowerCase()) || (u.email ?? '').toLowerCase().includes(search.toLowerCase()) || (u.firstName ?? '').toLowerCase().includes(search.toLowerCase()) || (u.lastName ?? '').toLowerCase().includes(search.toLowerCase()));
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const totalCorp = users.filter(u => u.role === 'admin-corporation').length;

    const TABS = [
        { id: 'users' as ActiveTab, icon: 'manage_accounts', label: t('super_admin.tab_users') },
        { id: 'vms' as ActiveTab, icon: 'dns', label: 'VMs' },
        { id: 'lxc' as ActiveTab, icon: 'widgets', label: 'LXC' },
        { id: 'rbac' as ActiveTab, icon: 'shield', label: 'RBAC' },
        { id: 'storage' as ActiveTab, icon: 'storage', label: 'Storage' },
        { id: 'pools' as ActiveTab, icon: 'folder_open', label: 'Pools' },
        { id: 'sdn' as ActiveTab, icon: 'lan', label: 'SDN' },
        { id: 'monitoring' as ActiveTab, icon: 'monitoring', label: 'Monitoring' },
    ];

    const TabLoading = () => (
        <div className={styles.loading}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>hourglass_empty</span>
            <p>{t('servers.loading')}</p>
        </div>
    );

    // ── SVG Sparkline ──────────────────────────────────────
    const Sparkline = ({ values, color = '#7c3aed', width = 240, height = 52 }: { values: number[]; color?: string; width?: number; height?: number }) => {
        const valid = values.filter(v => isFinite(v) && v >= 0);
        if (valid.length < 2) return <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>;
        const max = Math.max(...valid) || 1;
        const pad = 4;
        const pts = valid.map((v, i) =>
            `${(i / (valid.length - 1)) * width},${height - pad - ((v / max) * (height - pad * 2))}`
        ).join(' ');
        const apts = [
            `0,${height}`,
            ...valid.map((v, i) => `${(i / (valid.length - 1)) * width},${height - pad - ((v / max) * (height - pad * 2))}`),
            `${width},${height}`,
        ].join(' ');
        return (
            <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
                <defs>
                    <linearGradient id={`g${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                <polygon points={apts} fill={`url(#g${color.replace('#', '')})`} />
                <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
        );
    };

    const fmtPct  = (v: number) => `${(v * 100).toFixed(1)}%`;
    const fmtMem  = (v: number, max: number) => max ? `${fmt(v)} / ${fmt(max)}` : fmt(v);
    const fmtBps  = (v: number) => { if (!v) return '0 B/s'; if (v > 1e6) return `${(v/1e6).toFixed(1)} MB/s`; if (v > 1e3) return `${(v/1e3).toFixed(0)} KB/s`; return `${v.toFixed(0)} B/s`; };

    const fetchMonitoring = async () => {
        if (!monSelectedId) return;
        setMonLoading(true);
        setMonData(null);
        try {
            let r;
            if (monType === 'vm') {
                r = await api.vps.getMonitoring(monSelectedId);
            } else {
                r = await api.lxc.monitoring(Number(monSelectedId));
            }
            const raw = Array.isArray(r.data) ? r.data : (r.data?.data ?? r.data?.result ?? []);
            setMonData(raw as RrdPoint[]);
        } catch (e) {
            console.error('Monitoring fetch failed', e);
            setMonData([]);
        } finally {
            setMonLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('super_admin.title')}</h1>
                <span className={styles.badgeAdmin}>{t('super_admin.role_badge')}</span>
            </div>
            <p className={styles.subtitle}>{t('super_admin.subtitle')}</p>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}><span className={styles.statValue}>{users.length}</span><span className={styles.statLabel}>{t('super_admin.stat_users')}</span></div>
                <div className={styles.statCard}><span className={styles.statValue}>{totalCorp}</span><span className={styles.statLabel}>{t('super_admin.stat_corp_admins')}</span></div>
                <div className={styles.statCard}><span className={styles.statValue}>{totalAdmins}</span><span className={styles.statLabel}>{t('super_admin.stat_admins')}</span></div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {TABS.map(tab => (
                    <button key={tab.id} className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`} onClick={() => { setActiveTab(tab.id); setSearch(''); }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Users ── */}
            {activeTab === 'users' && (usersLoading ? <TabLoading /> : (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>{t('super_admin.users_title')}</h2>
                        <input className={styles.searchInput} type="text" placeholder={t('super_admin.search_users')} value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {filteredUsers.length === 0 ? <div className={styles.emptyState}><p>{t('servers.not_found')}</p></div> : (
                        <table className={styles.table}>
                            <thead><tr>
                                <th>{t('super_admin.col_user')}</th>
                                <th>{t('super_admin.col_username')}</th>
                                <th>{t('super_admin.col_role')}</th>
                                <th>{t('super_admin.col_actions')}</th>
                            </tr></thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={getAvatarClass(user.role)}>{(user.firstName?.[0] ?? user.username[0]).toUpperCase()}</div>
                                                <div>
                                                    <div className={styles.userName}>{[user.lastName, user.firstName].filter(Boolean).join(' ') || user.username}</div>
                                                    <div className={styles.userEmail}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.username}</td>
                                        <td><span className={getRoleBadgeClass(user.role)}>{ROLE_LABELS[user.role] ?? user.role}</span></td>
                                        <td>
                                            <div className={styles.actionsCell}>
                                                <button className={styles.btnPurple} onClick={() => openEditRole(user)}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>manage_accounts</span>
                                                    {t('super_admin.change_role')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ))}

            {/* ── VMs ── */}
            {activeTab === 'vms' && (vmsLoading ? <TabLoading /> : (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Proxmox VMs</h2>
                        <input className={styles.searchInput} type="text" placeholder="Search VMs…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {vms.length === 0 ? <div className={styles.emptyState}><p>No VMs found</p></div> : (
                        <table className={styles.table}>
                            <thead><tr><th>VMID</th><th>Name</th><th>Status</th><th>Node</th><th>Memory</th><th>Disk</th><th>Uptime</th></tr></thead>
                            <tbody>
                                {vms.filter(vm => !search || (vm.name ?? '').toLowerCase().includes(search.toLowerCase()) || String(vm.vmid ?? vm.proxmox_id ?? '').includes(search)).map((vm, i) => (
                                    <tr key={vm.vmid ?? vm.proxmox_id ?? i}>
                                        <td><code>{vm.vmid ?? vm.proxmox_id ?? '-'}</code></td>
                                        <td>{vm.name ?? '-'}</td>
                                        <td><StatusBadge status={vm.status} /></td>
                                        <td>{vm.node ?? '-'}</td>
                                        <td>{fmt(vm.maxmem as number)}</td>
                                        <td>{fmt(vm.maxdisk as number)}</td>
                                        <td>{fmtUp(vm.uptime as number)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ))}

            {/* ── LXC ── */}
            {activeTab === 'lxc' && (lxcLoading ? <TabLoading /> : (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>LXC Containers</h2></div>
                    {lxcList.length === 0 ? <div className={styles.emptyState}><p>No LXC containers found</p></div> : (
                        <table className={styles.table}>
                            <thead><tr><th>ID</th><th>Hostname</th><th>Status</th><th>Node</th><th>Memory</th><th>Actions</th></tr></thead>
                            <tbody>
                                {lxcList.map((ct, i) => {
                                    const id = ct.vmid ?? ct.proxmox_id;
                                    const running = (ct.status ?? '').toLowerCase() === 'running';
                                    return (
                                        <tr key={id ?? i}>
                                            <td><code>{id ?? '-'}</code></td>
                                            <td>{ct.hostname ?? ct.name ?? '-'}</td>
                                            <td><StatusBadge status={ct.status} /></td>
                                            <td>{ct.node ?? '-'}</td>
                                            <td>{fmt(ct.maxmem as number)}</td>
                                            <td>
                                                <div className={styles.actionsCell}>
                                                    {!running && id != null && <button className={styles.btnSecondary} disabled={lxcAction != null} onClick={() => handleLxcAction('start', id as number)}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>play_arrow</span>Start</button>}
                                                    {running && id != null && <>
                                                        <button className={styles.btnDanger} disabled={lxcAction != null} onClick={() => handleLxcAction('stop', id as number)}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>stop</span>Stop</button>
                                                        <button className={styles.btnSecondary} disabled={lxcAction != null} onClick={() => handleLxcAction('reboot', id as number)}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>restart_alt</span>Reboot</button>
                                                    </>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            ))}

            {/* ── RBAC ── */}
            {activeTab === 'rbac' && (rbacLoading ? <TabLoading /> : (
                <div>
                    <div className={styles.subTabs}>
                        <button className={`${styles.subTabBtn} ${rbacSubTab === 'roles' ? styles.subTabActive : ''}`} onClick={() => setRbacSubTab('roles')}>Roles</button>
                        <button className={`${styles.subTabBtn} ${rbacSubTab === 'pveusers' ? styles.subTabActive : ''}`} onClick={() => setRbacSubTab('pveusers')}>PVE Users</button>
                    </div>
                    <div className={styles.section}>
                        {rbacSubTab === 'roles' && (
                            <>
                                <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Proxmox Roles</h2></div>
                                {rbacRoles.length === 0 ? <div className={styles.emptyState}><p>No roles found</p></div> : (
                                    <table className={styles.table}>
                                        <thead><tr><th>Role ID</th><th>Privileges</th></tr></thead>
                                        <tbody>{rbacRoles.map((r, i) => <tr key={r.roleid ?? i}><td><strong>{r.roleid ?? '-'}</strong></td><td><span style={{ fontSize: '12px', color: 'var(--c-gray-500)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{String(r.privs ?? '-')}</span></td></tr>)}</tbody>
                                    </table>
                                )}
                            </>
                        )}
                        {rbacSubTab === 'pveusers' && (
                            <>
                                <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>PVE Users</h2></div>
                                {rbacUsers.length === 0 ? <div className={styles.emptyState}><p>No PVE users found</p></div> : (
                                    <table className={styles.table}>
                                        <thead><tr><th>User ID</th><th>Email</th><th>Groups</th><th>Enabled</th></tr></thead>
                                        <tbody>{rbacUsers.map((u, i) => <tr key={u.userid ?? i}><td><code>{u.userid ?? '-'}</code></td><td>{u.email ?? '-'}</td><td>{u.groups ?? '-'}</td><td>{u.enable ? '✓' : '✗'}</td></tr>)}</tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}

            {/* ── Storage ── */}
            {activeTab === 'storage' && (storageLoading ? <TabLoading /> : (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Global Storage</h2></div>
                    {storageList.length === 0 ? <div className={styles.emptyState}><p>No storage found</p></div> : (
                        <table className={styles.table}>
                            <thead><tr><th>Storage</th><th>Type</th><th>Content</th><th>Used</th><th>Available</th><th>Total</th></tr></thead>
                            <tbody>
                                {storageList.map((s, i) => {
                                    const pct = s.total ? Math.round(((s.used ?? 0) / s.total) * 100) : 0;
                                    return (
                                        <tr key={s.storage ?? i}>
                                            <td><strong>{s.storage ?? '-'}</strong></td>
                                            <td>{s.type ?? '-'}</td>
                                            <td><span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{String(s.content ?? '-')}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {fmt(s.used ?? 0)}
                                                    <div style={{ width: '60px', height: '4px', background: 'var(--c-gray-200)', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? '#c62828' : '#7c3aed', borderRadius: '2px' }} />
                                                    </div>
                                                    <span style={{ fontSize: '11px', color: 'var(--c-gray-500)' }}>{pct}%</span>
                                                </div>
                                            </td>
                                            <td>{fmt(s.avail ?? 0)}</td>
                                            <td>{fmt(s.total ?? 0)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            ))}

            {/* ── Pools ── */}
            {activeTab === 'pools' && (poolsLoading ? <TabLoading /> : (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>Resource Pools</h2></div>
                    {pools.length === 0 ? <div className={styles.emptyState}><p>No pools found</p></div> : (
                        <table className={styles.table}>
                            <thead><tr><th>Pool ID</th><th>Comment</th></tr></thead>
                            <tbody>{pools.map((p, i) => <tr key={p.poolid ?? i}><td><strong>{p.poolid ?? '-'}</strong></td><td>{String(p.comment ?? '-')}</td></tr>)}</tbody>
                        </table>
                    )}
                </div>
            ))}

            {/* ── Monitoring ── */}
            {activeTab === 'monitoring' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>RRD Monitoring</h2>
                        </div>
                        <div className={styles.monControls}>
                            {/* Type toggle */}
                            <div className={styles.monTypeToggle}>
                                <button
                                    className={`${styles.monTypeBtn} ${monType === 'vm' ? styles.monTypeBtnActive : ''}`}
                                    onClick={() => { setMonType('vm'); setMonSelectedId(''); setMonData(null); }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dns</span> VM
                                </button>
                                <button
                                    className={`${styles.monTypeBtn} ${monType === 'lxc' ? styles.monTypeBtnActive : ''}`}
                                    onClick={() => { setMonType('lxc'); setMonSelectedId(''); setMonData(null); }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>widgets</span> LXC
                                </button>
                            </div>
                            {/* Resource select */}
                            <select
                                className={styles.monSelect}
                                value={monSelectedId}
                                onChange={e => { setMonSelectedId(e.target.value); setMonData(null); }}
                            >
                                <option value="">— select resource —</option>
                                {monType === 'vm'
                                    ? dbVms.map(vm => (
                                        <option key={vm.id} value={String(vm.id)}>
                                            {vm.name ?? `VM-${vm.proxmox_id ?? vm.id}`} (id: {vm.id})
                                        </option>
                                    ))
                                    : lxcList.map((ct, i) => {
                                        const pid = ct.vmid ?? ct.proxmox_id;
                                        return (
                                            <option key={pid ?? i} value={String(pid ?? i)}>
                                                {ct.hostname ?? ct.name ?? `CT-${pid}`} (proxmox_id: {pid ?? '?'})
                                            </option>
                                        );
                                    })
                                }
                            </select>
                            {/* Fetch button */}
                            <button
                                className={styles.btnPrimary}
                                onClick={fetchMonitoring}
                                disabled={!monSelectedId || monLoading}
                            >
                                {monLoading
                                    ? <><span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>progress_activity</span> Loading…</>
                                    : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bar_chart</span> Load</>
                                }
                            </button>
                        </div>

                        {/* Charts */}
                        {monData !== null && monData.length === 0 && (
                            <div className={styles.emptyState}><p>No monitoring data returned from server.</p></div>
                        )}
                        {monData && monData.length > 0 && (() => {
                            const cpu    = monData.map(p => (p.cpu  ?? 0) as number);
                            const mem    = monData.map(p => (p.mem  ?? 0) as number);
                            const maxMem = monData[monData.length - 1]?.maxmem as number ?? 0;
                            const netin  = monData.map(p => (p.netin  ?? 0) as number);
                            const netout = monData.map(p => (p.netout ?? 0) as number);
                            const dread  = monData.map(p => (p.diskread  ?? 0) as number);
                            const dwrite = monData.map(p => (p.diskwrite ?? 0) as number);
                            const last   = monData[monData.length - 1] ?? {};

                            return (
                                <div className={styles.monCharts}>
                                    {/* CPU */}
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <span className={styles.metricTitle}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#7c3aed' }}>memory</span> CPU
                                            </span>
                                            <span className={styles.metricVal}>{fmtPct(last.cpu as number ?? 0)}</span>
                                        </div>
                                        <Sparkline values={cpu} color="#7c3aed" />
                                    </div>
                                    {/* RAM */}
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <span className={styles.metricTitle}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0284c7' }}>developer_board</span> RAM
                                            </span>
                                            <span className={styles.metricVal}>{fmtMem(last.mem as number ?? 0, maxMem)}</span>
                                        </div>
                                        <Sparkline values={mem} color="#0284c7" />
                                    </div>
                                    {/* Net In */}
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <span className={styles.metricTitle}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#059669' }}>arrow_downward</span> Net In
                                            </span>
                                            <span className={styles.metricVal}>{fmtBps(last.netin as number ?? 0)}</span>
                                        </div>
                                        <Sparkline values={netin} color="#059669" />
                                    </div>
                                    {/* Net Out */}
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <span className={styles.metricTitle}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#d97706' }}>arrow_upward</span> Net Out
                                            </span>
                                            <span className={styles.metricVal}>{fmtBps(last.netout as number ?? 0)}</span>
                                        </div>
                                        <Sparkline values={netout} color="#d97706" />
                                    </div>
                                    {/* Disk Read */}
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <span className={styles.metricTitle}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#db2777' }}>hard_drive</span> Disk Read
                                            </span>
                                            <span className={styles.metricVal}>{fmtBps(last.diskread as number ?? 0)}</span>
                                        </div>
                                        <Sparkline values={dread} color="#db2777" />
                                    </div>
                                    {/* Disk Write */}
                                    <div className={styles.metricCard}>
                                        <div className={styles.metricHeader}>
                                            <span className={styles.metricTitle}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ea580c' }}>save</span> Disk Write
                                            </span>
                                            <span className={styles.metricVal}>{fmtBps(last.diskwrite as number ?? 0)}</span>
                                        </div>
                                        <Sparkline values={dwrite} color="#ea580c" />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ── SDN ── */}
            {activeTab === 'sdn' && (sdnLoading ? <TabLoading /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>SDN Zones</h2></div>
                        {sdnZones.length === 0 ? <div className={styles.emptyState}><p>No SDN zones found</p></div> : (
                            <table className={styles.table}>
                                <thead><tr><th>Zone</th><th>Type</th><th>Nodes</th></tr></thead>
                                <tbody>{sdnZones.map((z, i) => <tr key={z.zone ?? i}><td><strong>{z.zone ?? '-'}</strong></td><td>{z.type ?? '-'}</td><td>{z.nodes ?? '-'}</td></tr>)}</tbody>
                            </table>
                        )}
                    </div>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>SDN VNets</h2></div>
                        {sdnVnets.length === 0 ? <div className={styles.emptyState}><p>No VNets found</p></div> : (
                            <table className={styles.table}>
                                <thead><tr><th>VNet</th><th>Zone</th><th>Tag</th></tr></thead>
                                <tbody>{sdnVnets.map((v, i) => <tr key={v.vnet ?? i}><td><strong>{v.vnet ?? '-'}</strong></td><td>{v.zone ?? '-'}</td><td>{v.tag ?? '-'}</td></tr>)}</tbody>
                            </table>
                        )}
                    </div>
                </div>
            ))}

            {/* Change Role Modal */}
            <AnimatePresence>
                {editUser && (
                    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => { if (e.target === e.currentTarget) setEditUser(null); }}>
                        <motion.div className={styles.modal} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <h3 className={styles.modalTitle}>{t('super_admin.modal_role_title')}</h3>
                            <p className={styles.modalSubtitle}>{t('super_admin.modal_role_subtitle')}: <strong>{editUser.username}</strong></p>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>{t('super_admin.col_role')}</label>
                                <select className={styles.formSelect} value={editRole} onChange={e => setEditRole(e.target.value as UserRole)}>
                                    <option value="user">user</option>
                                    <option value="admin-corporation">admin-corporation</option>
                                    <option value="admin">admin</option>
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button className={styles.btnCancel} onClick={() => setEditUser(null)}>{t('common.cancel')}</button>
                                <button className={styles.btnPrimary} onClick={handleSaveRole}>{t('common.save')}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
