import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import styles from './CreateServer.module.css';

const CPU_OPTIONS = [1, 2];
const RAM_OPTIONS = [256, 512, 1024, 2048];
const DISK_OPTIONS = [1, 2, 4, 8];

export const CreateServer: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useSettings();

    const [region, setRegion] = useState('Moscow');
    const [vcpu, setVcpu] = useState(1);
    const [ram, setRam] = useState(512);
    const [disk, setDisk] = useState(2);
    const [serverName, setServerName] = useState('');
    const [enabling, setEnabling] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnabling(true);
        try {
            await api.vps.create({
                name: serverName,
                cores: vcpu,
                memory: ram,
                disk_size: disk,
            });
            navigate('/servers');
        } catch (err) {
            console.error('Failed to create VM', err);
        } finally {
            setEnabling(false);
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

                {/* 1. Region */}
                <div className={`${styles['form-section']} animate-enter-d1`}>
                    <h2>1. {t('create_server.section_region')}</h2>
                    <div className={styles['options-grid']}>
                        <button type="button" className={`${styles['option-card']} ${region === 'Moscow' ? styles['active'] : ''}`} onClick={() => setRegion('Moscow')}>
                            {t('create_server.region_moscow')}
                        </button>
                        <button type="button" className={`${styles['option-card']} ${region === 'Minsk' ? styles['active'] : ''}`} onClick={() => setRegion('Minsk')}>
                            {t('create_server.region_minsk')}
                        </button>
                    </div>
                </div>

                {/* 2. Resources */}
                <div className={`${styles['form-section']} animate-enter-d2`}>
                    <h2>2. {t('create_server.section_resources')}</h2>

                    <div className={styles['resource-group']}>
                        <div className={styles['resource-header']}>
                            <span className="material-symbols-outlined">memory</span>
                            <label className={styles['resource-label']}>vCPU</label>
                            <span className={styles['resource-value']}>{vcpu} vCPU</span>
                        </div>
                        <div className={styles['resource-options']}>
                            {CPU_OPTIONS.map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    className={`${styles['resource-btn']} ${vcpu === v ? styles['resource-btn-active'] : ''}`}
                                    onClick={() => setVcpu(v)}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles['resource-group']}>
                        <div className={styles['resource-header']}>
                            <span className="material-symbols-outlined">dynamic_form</span>
                            <label className={styles['resource-label']}>RAM</label>
                            <span className={styles['resource-value']}>{ram} MB</span>
                        </div>
                        <div className={styles['resource-options']}>
                            {RAM_OPTIONS.map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    className={`${styles['resource-btn']} ${ram === v ? styles['resource-btn-active'] : ''}`}
                                    onClick={() => setRam(v)}
                                >
                                    {v} MB
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles['resource-group']}>
                        <div className={styles['resource-header']}>
                            <span className="material-symbols-outlined">hard_drive</span>
                            <label className={styles['resource-label']}>{t('create_server.disk_label')}</label>
                            <span className={styles['resource-value']}>{disk} GB</span>
                        </div>
                        <div className={styles['resource-options']}>
                            {DISK_OPTIONS.map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    className={`${styles['resource-btn']} ${disk === v ? styles['resource-btn-active'] : ''}`}
                                    onClick={() => setDisk(v)}
                                >
                                    {v} GB
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Server Name */}
                <div className={`${styles['form-section']} animate-enter-d3`}>
                    <h2>3. {t('create_server.server_name_label')}</h2>
                    <div className={styles['settings-group']}>
                        <input
                            type="text"
                            className={styles['text-input']}
                            placeholder={t('create_server.server_name_placeholder')}
                            value={serverName}
                            onChange={(e) => setServerName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className={`${styles['form-actions']} animate-enter-d3`}>
                    <button type="button" className={styles['btn-cancel']} onClick={() => navigate('/servers')}>{t('common.cancel')}</button>
                    <button type="submit" className="btn-primary" disabled={enabling}>
                        {enabling ? t('common.saving') : t('create_server.title')}
                    </button>
                </div>
            </form>
        </div>
    );
};
