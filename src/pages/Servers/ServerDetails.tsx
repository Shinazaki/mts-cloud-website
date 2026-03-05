import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import type { Vm } from '../../types/auth';
import styles from './Servers.module.css';
import detailStyles from './ServerDetails.module.css';

const statusColor = (status?: string) => {
    if (!status) return '#aaa';
    const s = status.toLowerCase();
    if (s === 'running') return '#10B981';
    if (s === 'stopped') return '#EF4444';
    return '#F59E0B';
};

export const ServerDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();
    const queryClient = useQueryClient();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const { data: vmResponse, isLoading } = useQuery({
        queryKey: ['vps', id],
        queryFn: () => api.vps.getById(id!),
        enabled: !!id,
    });

    const vm: Vm | undefined = vmResponse?.data as Vm | undefined;

    const runAction = async (action: 'start' | 'stop' | 'restart' | 'shutdown') => {
        if (!vm) return;
        setActionLoading(action);
        try {
            await api.vps[action]({ id: vm.id });
            await queryClient.invalidateQueries({ queryKey: ['vps', id] });
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) return <div style={{ padding: 32 }}>{t('servers.loading')}</div>;
    if (!vm) return <div style={{ padding: 32 }}>{t('servers.not_found')}</div>;

    const isRunning = vm.status?.toLowerCase() === 'running';
    const isStopped = vm.status?.toLowerCase() === 'stopped';

    return (
        <div className={styles['page-container']}>
            <div className={styles['page-header']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className={styles['btn-outline']} onClick={() => navigate('/servers')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className={styles['page-title']}>{vm.name ?? `VM-${vm.proxmox_id}`}</h1>
                        <span className={detailStyles['status-badge']} style={{ color: statusColor(vm.status) }}>
                            <span className={detailStyles['status-dot']} style={{ backgroundColor: statusColor(vm.status) }} />
                            {vm.status ?? '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Power Control Buttons */}
            <div className={`${detailStyles['power-controls']} animate-enter`}>
                <button
                    className={`${detailStyles['power-btn']} ${detailStyles['power-btn-start']}`}
                    onClick={() => runAction('start')}
                    disabled={actionLoading !== null || isRunning}
                >
                    <span className="material-symbols-outlined">play_arrow</span>
                    {actionLoading === 'start' ? '...' : t('servers.action_start')}
                </button>
                <button
                    className={`${detailStyles['power-btn']} ${detailStyles['power-btn-stop']}`}
                    onClick={() => runAction('stop')}
                    disabled={actionLoading !== null || isStopped}
                >
                    <span className="material-symbols-outlined">stop</span>
                    {actionLoading === 'stop' ? '...' : t('servers.action_stop')}
                </button>
                <button
                    className={`${detailStyles['power-btn']} ${detailStyles['power-btn-restart']}`}
                    onClick={() => runAction('restart')}
                    disabled={actionLoading !== null || isStopped}
                >
                    <span className="material-symbols-outlined">restart_alt</span>
                    {actionLoading === 'restart' ? '...' : t('servers.action_restart')}
                </button>
            </div>

            <div className={detailStyles['details-grid']}>
                {/* General Info */}
                <div className={`card animate-enter-d1 ${detailStyles['info-card']}`}>
                    <h3>{t('server_details.general_info')}</h3>
                    <div className={detailStyles['info-grid']}>
                        <div className={detailStyles['info-item']}>
                            <span className="material-symbols-outlined">language</span>
                            <div>
                                <label>IP</label>
                                <span>{vm.ip_address ?? '—'}</span>
                            </div>
                        </div>
                        <div className={detailStyles['info-item']}>
                            <span className="material-symbols-outlined">tag</span>
                            <div>
                                <label>Proxmox ID</label>
                                <span>{vm.proxmox_id}</span>
                            </div>
                        </div>
                        <div className={detailStyles['info-item']}>
                            <span className="material-symbols-outlined">dns</span>
                            <div>
                                <label>Node</label>
                                <span>{vm.node ?? '—'}</span>
                            </div>
                        </div>
                        <div className={detailStyles['info-item']}>
                            <span className="material-symbols-outlined">info</span>
                            <div>
                                <label>{t('server_details.status')}</label>
                                <span style={{ color: statusColor(vm.status) }}>{vm.status ?? '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration */}
                {vm.configuration && (
                    <div className={`card animate-enter-d2 ${detailStyles['info-card']}`}>
                        <h3>{t('server_details.server_configuration')}</h3>
                        <div className={detailStyles['config-stats']}>
                            <div className={detailStyles['config-stat']}>
                                <span className="material-symbols-outlined">memory</span>
                                <div className={detailStyles['config-stat-value']}>{vm.configuration.cpu}</div>
                                <div className={detailStyles['config-stat-label']}>vCPU</div>
                            </div>
                            <div className={detailStyles['config-stat']}>
                                <span className="material-symbols-outlined">dynamic_form</span>
                                <div className={detailStyles['config-stat-value']}>{vm.configuration.ram} MB</div>
                                <div className={detailStyles['config-stat-label']}>RAM</div>
                            </div>
                            <div className={detailStyles['config-stat']}>
                                <span className="material-symbols-outlined">hard_drive</span>
                                <div className={detailStyles['config-stat-value']}>{vm.configuration.ssd} GB</div>
                                <div className={detailStyles['config-stat-label']}>NVMe</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VM Info */}
                <div className={`card animate-enter-d3 ${detailStyles['info-card']}`}>
                    <h3>{t('server_details.vm_info')}</h3>
                    <div className={detailStyles['vm-info-list']}>
                        <div><strong>OS Template:</strong> {vm.configuration?.os_template ?? '—'}</div>
                        <div><strong>Storage:</strong> {vm.configuration?.storage ?? '—'}</div>
                        <div><strong>Pool:</strong> {vm.configuration?.pool ?? '—'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
