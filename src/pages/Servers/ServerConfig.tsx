import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import type { Vm } from '../../types/auth';
import styles from './Servers.module.css';

export const ServerConfig: React.FC = () => {
    const { id } = useParams();
    const proxmoxId = Number(id);
    const navigate = useNavigate();
    const { t } = useSettings();
    const queryClient = useQueryClient();

    const { data: vmsResponse, isLoading: loadingVms } = useQuery({
        queryKey: ['vps'],
        queryFn: api.vps.getAll,
    });

    const vms: Vm[] = (vmsResponse?.data as Vm[] | undefined) ?? [];
    const vm = vms.find(v => v.proxmox_id === proxmoxId);

    const [cores, setCores] = useState('');
    const [memory, setMemory] = useState('');
    const [disk, setDisk] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [initialised, setInitialised] = useState(false);

    // Initialise form from fetched VM once
    if (vm && !initialised) {
        setCores(String(vm.configuration?.cores ?? ''));
        setMemory(String(vm.configuration?.memory ?? ''));
        setDisk(String(vm.configuration?.disk ?? ''));
        setInitialised(true);
    }

    const cpuOptions = ['1', '2', '4', '8', '16', '32'];
    const ramOptions = ['512', '1024', '2048', '4096', '8192', '16384', '32768', '65536'];
    const diskOptions = ['20', '40', '60', '100', '200', '500', '1000'];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.vps.update({
                proxmox_id: proxmoxId,
                cores: Number(cores) || undefined,
                memory: Number(memory) || undefined,
                disk: Number(disk) || undefined,
            });
            await queryClient.invalidateQueries({ queryKey: ['vps'] });
            navigate('/servers');
        } catch (err) {
            console.error('Failed to update VM config', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingVms) return <div style={{ padding: 32 }}>{t('servers.loading')}</div>;
    if (!vm) return <div style={{ padding: 32 }}>{t('servers.not_found')}</div>;

    return (
        <div className={styles['page-container']}>
            <div className={styles['page-header']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className={styles['btn-outline']} onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--c-dark-blue)' }}>arrow_back</span>
                    </button>
                    <h1 className={styles['page-title']}>{t('server_config.page_title')}</h1>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '800px', padding: '40px', marginTop: '24px' }}>
                <h2 style={{ marginBottom: '32px', color: 'var(--c-dark-blue)' }}>{vm.name ?? `VM-${vm.proxmox_id}`}</h2>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--c-gray-600)' }}>{t('server_config.cpu_label')}</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={cores}
                                onChange={e => setCores(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--c-gray-300)',
                                    fontSize: '16px',
                                    appearance: 'none',
                                    backgroundColor: 'var(--c-white)',
                                    color: 'var(--c-gray-900)'
                                }}
                            >
                                {cpuOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt} vCPU</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--c-gray-400)' }}>expand_more</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--c-gray-600)' }}>{t('server_config.ram_label')}</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={memory}
                                onChange={e => setMemory(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--c-gray-300)',
                                    fontSize: '16px',
                                    appearance: 'none',
                                    backgroundColor: 'var(--c-white)',
                                    color: 'var(--c-gray-900)'
                                }}
                            >
                                {ramOptions.map(opt => (
                                    <option key={opt} value={opt}>{Number(opt) >= 1024 ? `${Number(opt)/1024} GB` : `${opt} MB`}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--c-gray-400)' }}>expand_more</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--c-gray-600)' }}>{t('server_config.disk_label')}</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={disk}
                                onChange={e => setDisk(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--c-gray-300)',
                                    fontSize: '16px',
                                    appearance: 'none',
                                    backgroundColor: 'var(--c-white)',
                                    color: 'var(--c-gray-900)'
                                }}
                            >
                                {diskOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt} GB NVMe</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--c-gray-400)' }}>expand_more</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                        <button type="button" className={styles['btn-outline']} onClick={() => navigate(-1)}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className={styles['btn-primary']} disabled={isSaving} style={{ padding: '12px 32px' }}>
                            {isSaving ? t('common.saving') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
