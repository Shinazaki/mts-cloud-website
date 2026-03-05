import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { api } from '../../api/client';
import styles from '../../Styles/PageHeaders.module.css';

// ── Types ──────────────────────────────────────────────────
interface VmWithSnapshots {
    id: string;
    proxmox_id?: number;
    name: string;
    status?: string;
}
interface Snapshot {
    name?: string;
    snapname?: string;
    description?: string;
    snaptime?: number;
    vmstate?: number;
    [k: string]: unknown;
}
interface ClusterResource {
    id?: string;
    name?: string;
    type?: string;
    status?: string;
    node?: string;
    cpu?: number;
    maxcpu?: number;
    mem?: number;
    maxmem?: number;
    disk?: number;
    maxdisk?: number;
    uptime?: number;
    [k: string]: unknown;
}

const fmtBytes = (b: number) => { if (!b) return '-'; const g = b / (1024 ** 3); return g >= 1 ? `${g.toFixed(1)} GB` : `${(b / (1024 ** 2)).toFixed(0)} MB`; };
const fmtDate = (ts?: number) => ts ? new Date(ts * 1000).toLocaleString() : '-';

export const Backups: React.FC = () => {
    const { t } = useSettings();
    const [vms, setVms] = useState<VmWithSnapshots[]>([]);
    const [snapshots, setSnapshots] = useState<Record<string, Snapshot[]>>({});
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [snapLoading, setSnapLoading] = useState<Set<string>>(new Set());
    const [creating, setCreating] = useState<string | null>(null);
    const [snapDesc, setSnapDesc] = useState('');

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await api.vps.getMy();
                setVms(r.data as VmWithSnapshots[]);
            } catch { setVms([]); }
            finally { setLoading(false); }
        })();
    }, []);

    const toggleVm = async (vmId: string) => {
        const next = new Set(expanded);
        if (next.has(vmId)) { next.delete(vmId); setExpanded(next); return; }
        next.add(vmId);
        setExpanded(next);
        if (!snapshots[vmId]) {
            setSnapLoading(prev => new Set(prev).add(vmId));
            try {
                const r = await api.vps.listSnapshots(vmId);
                const arr: Snapshot[] = Array.isArray(r.data) ? r.data : (r.data as { data?: Snapshot[] })?.data ?? [];
                setSnapshots(prev => ({ ...prev, [vmId]: arr }));
            } catch { setSnapshots(prev => ({ ...prev, [vmId]: [] })); }
            finally { setSnapLoading(prev => { const s = new Set(prev); s.delete(vmId); return s; }); }
        }
    };

    const createSnapshot = async (vmId: string) => {
        const desc = snapDesc.trim() || `snapshot-${Date.now()}`;
        setCreating(vmId);
        try {
            await api.vps.createSnapshot({ vmId, snapname: desc });
            setSnapshots(prev => { const s = { ...prev }; delete s[vmId]; return s; });
            setSnapDesc('');
            // re-fetch snapshots for this VM
            const r = await api.vps.listSnapshots(vmId);
            const arr: Snapshot[] = Array.isArray(r.data) ? r.data : (r.data as { data?: Snapshot[] })?.data ?? [];
            setSnapshots(prev => ({ ...prev, [vmId]: arr }));
        } catch (e) { console.error(e); }
        finally { setCreating(null); }
    };

    const deleteSnapshot = async (vmId: string, snapname: string) => {
        if (!window.confirm(`Delete snapshot "${snapname}"?`)) return;
        try {
            await api.vps.deleteSnapshot({ vmId, snapname });
            setSnapshots(prev => ({ ...prev, [vmId]: (prev[vmId] ?? []).filter(s => (s.snapname ?? s.name) !== snapname) }));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.backups_title')}</h1>
            </div>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--c-gray-500)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>hourglass_empty</span>
                    <p>Loading…</p>
                </div>
            ) : vms.length === 0 ? (
                <div className="card animate-enter">
                    <p style={{ color: 'var(--c-gray-500)' }}>{t('pages.backups_desc')}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {vms.map(vm => {
                        const vmId = vm.id;
                        const open = expanded.has(vmId);
                        const snaps = snapshots[vmId] ?? [];
                        const loading2 = snapLoading.has(vmId);
                        return (
                            <div key={vm.id} className="card animate-enter" style={{ padding: 0, overflow: 'hidden' }}>
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => toggleVm(vmId)}
                                >
                                    <span className="material-symbols-outlined" style={{ color: 'var(--c-accent)', fontSize: '20px' }}>dns</span>
                                    <span style={{ fontWeight: 600, color: 'var(--c-dark-blue)', flex: 1 }}>{vm.name}</span>
                                    {vm.proxmox_id != null && vm.proxmox_id > 0 && <span style={{ fontSize: '12px', color: 'var(--c-gray-500)' }}>ID: {vm.proxmox_id}</span>}
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--c-gray-500)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>expand_more</span>
                                </div>

                                {open && (
                                    <div style={{ borderTop: '1px solid var(--c-gray-100)', padding: '16px 20px' }}>
                                        {loading2 ? (
                                            <p style={{ color: 'var(--c-gray-500)', fontSize: '13px' }}>Loading snapshots…</p>
                                        ) : (
                                            <>
                                                {snaps.length === 0 ? (
                                                    <p style={{ color: 'var(--c-gray-500)', fontSize: '13px' }}>No snapshots yet.</p>
                                                ) : (
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '1px solid var(--c-gray-200)' }}>
                                                                <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Name</th>
                                                                <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Description</th>
                                                                <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Created</th>
                                                                <th style={{ padding: '6px 8px' }}></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {snaps.map((s, i) => {
                                                                const sname = String(s.snapname ?? s.name ?? `snap-${i}`);
                                                                return (
                                                                    <tr key={sname} style={{ borderBottom: '1px solid var(--c-gray-100)' }}>
                                                                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{sname}</td>
                                                                        <td style={{ padding: '8px', color: 'var(--c-gray-600)' }}>{String(s.description ?? '-')}</td>
                                                                        <td style={{ padding: '8px', color: 'var(--c-gray-500)' }}>{fmtDate(s.snaptime)}</td>
                                                                        <td style={{ padding: '8px' }}>
                                                                            <button
                                                                                onClick={() => deleteSnapshot(vmId, sname)}
                                                                                style={{ background: 'transparent', border: '1px solid var(--c-bright-red, #e53935)', color: 'var(--c-bright-red, #e53935)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', cursor: 'pointer' }}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                                {vmId && (
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Snapshot description (optional)"
                                                            value={creating === vmId ? snapDesc : ''}
                                                            onChange={e => setSnapDesc(e.target.value)}
                                                            onFocus={() => setCreating(vmId)}
                                                            style={{ flex: 1, padding: '7px 12px', border: '1px solid var(--c-gray-200)', borderRadius: '8px', fontSize: '13px', background: 'var(--c-white)', color: 'var(--c-dark-blue)', outline: 'none' }}
                                                        />
                                                        <button
                                                            disabled={creating === vmId && snapDesc === '' ? false : creating !== null && creating !== vmId}
                                                            onClick={() => createSnapshot(vmId)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
                                                            Create snapshot
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const Monitoring: React.FC = () => {
    const { t } = useSettings();
    const [resources, setResources] = useState<ClusterResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'vm' | 'node' | 'storage'>('all');

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const r = await api.vps.getClusterResources();
                const arr: ClusterResource[] = Array.isArray(r.data) ? r.data : (r.data as { data?: ClusterResource[] })?.data ?? [];
                setResources(arr);
            } catch { setResources([]); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = filter === 'all' ? resources : resources.filter(r => r.type === filter);
    const nodes = resources.filter(r => r.type === 'node');
    const totalVms = resources.filter(r => r.type === 'qemu' || r.type === 'lxc').length;
    const runningVms = resources.filter(r => (r.type === 'qemu' || r.type === 'lxc') && r.status === 'running').length;

    const PctBar = ({ used, max, warn = 80 }: { used: number; max: number; warn?: number }) => {
        const pct = max > 0 ? Math.round((used / max) * 100) : 0;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '80px', height: '6px', background: 'var(--c-gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct > warn ? '#c62828' : '#7c3aed', borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--c-gray-500)', minWidth: '32px' }}>{pct}%</span>
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.monitoring_title')}</h1>
                <button className="btn-outline" onClick={() => { setLoading(true); api.vps.getClusterResources().then(r => { const arr: ClusterResource[] = Array.isArray(r.data) ? r.data : (r.data as { data?: ClusterResource[] })?.data ?? []; setResources(arr); }).catch(() => setResources([])).finally(() => setLoading(false)); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                    Refresh
                </button>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {nodes.map(n => (
                    <div key={n.id} className="card" style={{ flex: '1', minWidth: '200px', padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span className="material-symbols-outlined" style={{ color: n.status === 'online' ? '#2e7d32' : '#c62828', fontSize: '18px' }}>circle</span>
                            <span style={{ fontWeight: 600, color: 'var(--c-dark-blue)' }}>{n.node ?? n.name ?? n.id}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--c-gray-500)' }}>CPU</span>
                                <PctBar used={(n.cpu ?? 0) * (n.maxcpu ?? 1)} max={n.maxcpu ?? 1} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--c-gray-500)' }}>RAM</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <PctBar used={n.mem ?? 0} max={n.maxmem ?? 1} />
                                    <span style={{ fontSize: '11px', color: 'var(--c-gray-400)' }}>{fmtBytes(n.mem ?? 0)}/{fmtBytes(n.maxmem ?? 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="card" style={{ flex: '0 1 160px', padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--c-dark-blue)' }}>{runningVms}/{totalVms}</div>
                    <div style={{ fontSize: '12px', color: 'var(--c-gray-500)', marginTop: '4px' }}>VMs / Containers running</div>
                </div>
            </div>

            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {(['all', 'vm', 'node', 'storage'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', fontSize: '13px', cursor: 'pointer', fontWeight: 500, background: filter === f ? '#7c3aed' : 'transparent', color: filter === f ? '#fff' : 'var(--c-gray-500)', borderColor: filter === f ? '#7c3aed' : 'var(--c-gray-200)', transition: 'all 0.15s' }}>
                        {f === 'all' ? 'All' : f.toUpperCase()}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--c-gray-500)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>hourglass_empty</span>
                    <p>Loading cluster resources…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card animate-enter"><p style={{ color: 'var(--c-gray-500)' }}>No resources found.</p></div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-gray-50, #f8f9fa)', borderBottom: '1px solid var(--c-gray-200)' }}>
                                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Name</th>
                                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Type</th>
                                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Node</th>
                                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>CPU</th>
                                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Memory</th>
                                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--c-gray-500)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Disk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => (
                                <tr key={r.id ?? i} style={{ borderBottom: '1px solid var(--c-gray-100)' }}>
                                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: 'var(--c-gray-600)' }}>{r.id ?? '-'}</td>
                                    <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--c-dark-blue)' }}>{r.name ?? '-'}</td>
                                    <td style={{ padding: '10px 16px' }}>
                                        <span style={{ padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: r.type === 'node' ? '#e3f2fd' : r.type === 'storage' ? '#fff3e0' : '#ede7f6', color: r.type === 'node' ? '#1565c0' : r.type === 'storage' ? '#e65100' : '#7c3aed' }}>{r.type ?? '-'}</span>
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        {r.status === 'running' || r.status === 'online' ? <span style={{ color: '#2e7d32', fontWeight: 600 }}>● {r.status}</span> : <span style={{ color: '#757575' }}>{r.status ?? '-'}</span>}
                                    </td>
                                    <td style={{ padding: '10px 16px', color: 'var(--c-gray-600)' }}>{r.node ?? '-'}</td>
                                    <td style={{ padding: '10px 16px' }}>{r.maxcpu ? <PctBar used={Math.round((r.cpu ?? 0) * (r.maxcpu ?? 1))} max={r.maxcpu} /> : '-'}</td>
                                    <td style={{ padding: '10px 16px' }}>{r.maxmem ? <><PctBar used={r.mem ?? 0} max={r.maxmem} /><span style={{ fontSize: '11px', color: 'var(--c-gray-400)' }}>{fmtBytes(r.mem ?? 0)}</span></> : '-'}</td>
                                    <td style={{ padding: '10px 16px', color: 'var(--c-gray-600)' }}>{r.maxdisk ? fmtBytes(r.maxdisk) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export const Traffic: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.traffic_title')}</h1>
            </div>
            <div className="card animate-enter">
                <h3>{t('pages.traffic_subtitle')}</h3>
                <p>{t('pages.traffic_desc')}</p>
            </div>
        </div>
    );
};

export const APIPage: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.api_title')}</h1>
                <button className="btn-primary">
                    {t('pages.api_generate_token')} <span className="material-symbols-outlined">key</span>
                </button>
            </div>
            <div className="card animate-enter">
                <h3>{t('pages.api_subtitle')}</h3>
                <p>{t('pages.api_desc')}</p>
            </div>
        </div>
    );
};

export const QA: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.qa_title')}</h1>
            </div>
            <div className="card animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>{t('pages.qa_q1_title')}</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: t('pages.qa_q1_desc') }}></p>
                </div>
                <div>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>{t('pages.qa_q2_title')}</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: t('pages.qa_q2_desc') }}></p>
                </div>
                <div>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>{t('pages.qa_q3_title')}</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: t('pages.qa_q3_desc') }}></p>
                </div>
            </div>
        </div>
    );
};

export const WhatsNew: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.whats_new_title')}</h1>
            </div>
            <div className="card animate-enter">
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '32px', borderBottom: '1px solid var(--c-gray-100)', paddingBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--c-red)' }}>new_releases</span>
                            <strong style={{ fontSize: '18px', color: 'var(--c-dark-blue)' }}>{t('pages.whats_new_v5_title')}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--c-gray-500)', marginLeft: 'auto' }}>{t('pages.whats_new_today')}</span>
                        </div>
                        <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.6' }}>
                            {t('pages.whats_new_v5_desc')}
                            <br />- {t('pages.whats_new_v5_global')}
                            <br />- {t('pages.whats_new_v5_server')}
                            <br />- {t('pages.whats_new_v5_billing')}
                            <br />- {t('pages.whats_new_v5_localization')}
                            <br />- {t('pages.whats_new_v5_interface')}
                        </p>
                    </li>
                    <li style={{ marginBottom: '32px', borderBottom: '1px solid var(--c-gray-100)', paddingBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--c-gray-500)' }}>history</span>
                            <strong style={{ fontSize: '18px', color: 'var(--c-dark-blue)' }}>{t('pages.whats_new_v2_title')}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--c-gray-500)', marginLeft: 'auto' }}>{t('pages.whats_new_earlier')}</span>
                        </div>
                        <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.6' }}>
                            {t('pages.whats_new_v2_desc')}
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
};
