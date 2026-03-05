import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import styles from './CreateServer.module.css';

type ServerType = 'vm' | 'lxc';
const CORES_OPTIONS = [1, 2, 4];
const RAM_OPTIONS   = [256, 512, 1024, 2048];
const DISK_OPTIONS  = [8, 16, 32, 64];

const OS_TEMPLATE = 'local:vztmpl/alpine-standard.tar.zst';

export const CreateServer: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useSettings();

    const [serverType, setServerType] = useState<ServerType>('lxc');

    // LXC fields
    const [hostname, setHostname]   = useState('');
    const [cores, setCores]         = useState(1);
    const [memory, setMemory]       = useState(512);
    const [disk, setDisk]           = useState(8);
    const [sshKey, setSshKey]       = useState('');
    const [password, setPassword]   = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!hostname.trim()) {
            setError(t('create_server.hostname_required'));
            return;
        }
        if (!sshKey.trim() && !password.trim()) {
            setError(t('create_server.access_required'));
            return;
        }

        setSubmitting(true);
        try {
            await api.lxc.create({
                hostname: hostname.trim(),
                ostemplate: OS_TEMPLATE,
                cores,
                memory,
                rootfs: `local-lvm:${disk}`,
                net0: 'name=vnet10,bridge=vmbr0,ip=dhcp',
                ...(sshKey.trim()  ? { sshPublicKeys: sshKey.trim() }  : {}),
                ...(password.trim() ? { password: password.trim() }      : {}),
                unprivileged: true,
                start: true,
            });
            navigate('/servers');
        } catch (err) {
            console.error('LXC create error', err);
            setError(t('create_server.create_error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`page-container ${styles['create-server-page']}`}>
            <div className="page-header">
                <div className={styles['header-breadcrumbs']}>
                    <button className={styles['back-btn']} onClick={() => navigate('/servers')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="page-title">{t('create_server.title')}</h1>
                </div>
            </div>

            <form className={styles['create-server-form']} onSubmit={handleCreate}>

                {/* 1. Тип сервера */}
                <div className={`${styles['form-section']} animate-enter-d1`}>
                    <h2>1. {t('create_server.type_label')}</h2>
                    <div className={styles['options-grid']}>
                        <button
                            type="button"
                            className={`${styles['option-card']} ${styles['option-card-disabled']}`}
                            disabled
                            title={t('create_server.coming_soon')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dns</span>
                            {t('create_server.type_vm')}
                            <span className={styles['badge-soon']}>{t('create_server.coming_soon')}</span>
                        </button>
                        <button
                            type="button"
                            className={`${styles['option-card']} ${serverType === 'lxc' ? styles['active'] : ''}`}
                            onClick={() => setServerType('lxc')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>widgets</span>
                            {t('create_server.type_lxc')}
                        </button>
                    </div>

                    {/* OS Template info */}
                    <div className={styles['os-info']}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-gray-500)' }}>info</span>
                        <span style={{ fontSize: '13px', color: 'var(--c-gray-500)' }}>
                            {t('create_server.os_template_label')}: <code style={{ background: 'var(--c-gray-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{OS_TEMPLATE}</code>
                        </span>
                    </div>
                </div>

                {/* 2. Ресурсы */}
                <div className={`${styles['form-section']} animate-enter-d2`}>
                    <h2>2. {t('create_server.section_resources')}</h2>

                    <div className={styles['resource-group']}>
                        <div className={styles['resource-header']}>
                            <span className="material-symbols-outlined">memory</span>
                            <label className={styles['resource-label']}>CPU (cores)</label>
                            <span className={styles['resource-value']}>{cores} core{cores > 1 ? 's' : ''}</span>
                        </div>
                        <div className={styles['resource-options']}>
                            {CORES_OPTIONS.map(v => (
                                <button key={v} type="button"
                                    className={`${styles['resource-btn']} ${cores === v ? styles['resource-btn-active'] : ''}`}
                                    onClick={() => setCores(v)}>
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles['resource-group']}>
                        <div className={styles['resource-header']}>
                            <span className="material-symbols-outlined">dynamic_form</span>
                            <label className={styles['resource-label']}>RAM</label>
                            <span className={styles['resource-value']}>{memory} MB</span>
                        </div>
                        <div className={styles['resource-options']}>
                            {RAM_OPTIONS.map(v => (
                                <button key={v} type="button"
                                    className={`${styles['resource-btn']} ${memory === v ? styles['resource-btn-active'] : ''}`}
                                    onClick={() => setMemory(v)}>
                                    {v} MB
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles['resource-group']}>
                        <div className={styles['resource-header']}>
                            <span className="material-symbols-outlined">hard_drive</span>
                            <label className={styles['resource-label']}>{t('create_server.disk_label')} (rootfs)</label>
                            <span className={styles['resource-value']}>{disk} GB</span>
                        </div>
                        <div className={styles['resource-options']}>
                            {DISK_OPTIONS.map(v => (
                                <button key={v} type="button"
                                    className={`${styles['resource-btn']} ${disk === v ? styles['resource-btn-active'] : ''}`}
                                    onClick={() => setDisk(v)}>
                                    {v} GB
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Имя хоста */}
                <div className={`${styles['form-section']} animate-enter-d3`}>
                    <h2>3. {t('create_server.hostname_label')}</h2>
                    <div className={styles['settings-group']}>
                        <label className={styles['input-label']}>{t('create_server.hostname_label')}</label>
                        <input
                            type="text"
                            className={styles['text-input']}
                            placeholder={t('create_server.hostname_placeholder')}
                            value={hostname}
                            pattern="^[A-Za-z0-9_-]+$"
                            title={t('create_server.hostname_hint')}
                            onChange={e => setHostname(e.target.value)}
                            required
                        />
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--c-gray-500)' }}>
                            {t('create_server.hostname_hint')}
                        </p>
                    </div>

                    {/* Сеть — фиксированная, показываем как инфо */}
                    <div className={styles['os-info']} style={{ marginTop: '16px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-gray-500)' }}>lan</span>
                        <span style={{ fontSize: '13px', color: 'var(--c-gray-500)' }}>
                            {t('create_server.network_label')}: <code style={{ background: 'var(--c-gray-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>name=vnet10, bridge=vmbr0, ip=dhcp</code>
                        </span>
                    </div>
                </div>

                {/* 4. Доступ */}
                <div className={`${styles['form-section']} animate-enter-d3`}>
                    <h2>4. {t('create_server.section_access')}</h2>

                    <div className={styles['settings-group']}>
                        <label className={styles['input-label']}>{t('create_server.ssh_key_label')}</label>
                        <textarea
                            className={`${styles['text-input']} ${styles['textarea-input']}`}
                            placeholder={t('create_server.ssh_placeholder')}
                            value={sshKey}
                            onChange={e => setSshKey(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className={styles['settings-group']}>
                        <label className={styles['input-label']}>{t('create_server.password_root_label')}</label>
                        <input
                            type="password"
                            className={styles['text-input']}
                            placeholder={t('create_server.password_placeholder')}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--c-gray-500)' }}>
                            {t('create_server.access_hint')}
                        </p>
                    </div>
                </div>

                {/* Ошибка */}
                {error && (
                    <div style={{ background: 'rgba(198,40,40,0.07)', border: '1px solid #c62828', borderRadius: '8px', padding: '12px 16px', color: '#c62828', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                        {error}
                    </div>
                )}

                {/* Действия */}
                <div className={`${styles['form-actions']} animate-enter-d3`}>
                    <button type="button" className={styles['btn-cancel']} onClick={() => navigate('/servers')}>
                        {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting
                            ? <><span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite', verticalAlign: 'middle', marginRight: '6px' }}>progress_activity</span>{t('common.saving')}</>
                            : <><span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>widgets</span>{t('create_server.create_lxc_btn')}</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
};
