import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import styles from './CreateServer.module.css';

interface Tariff {
    id: string;
    name: string;
    cpu: number;
    ram: number;
    disk: number;
    price: number;
}

const TARIFFS: Tariff[] = [
    { id: 't1', name: 'Start', cpu: 1, ram: 1, disk: 15, price: 15 },
    { id: 't2', name: 'Basic', cpu: 2, ram: 2, disk: 30, price: 25 },
    { id: 't3', name: 'Optima', cpu: 2, ram: 4, disk: 50, price: 40 },
    { id: 't4', name: 'Pro', cpu: 4, ram: 8, disk: 80, price: 75 },
    { id: 't5', name: 'Ultra', cpu: 8, ram: 16, disk: 160, price: 140 },
];

export const CreateServer: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useSettings();

    // Server Configuration State
    const [region, setRegion] = useState('Moscow');
    const [osClass, setOsClass] = useState('Ubuntu');
    const [osVersion, setOsVersion] = useState('22.04 LTS');
    const [tariffId, setTariffId] = useState('t2'); // default to Basic
    const [serverName, setServerName] = useState('');
    const [enableBackups, setEnableBackups] = useState(false);
    const [authMethod, setAuthMethod] = useState<'password' | 'ssh'>('password');
    const [password, setPassword] = useState('');
    const [sshKey, setSshKey] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedTariff = TARIFFS.find(t => t.id === tariffId);

        const payload = {
            name: serverName,
            region,
            os: `${osClass} ${osVersion}`,
            tariff: selectedTariff,
            backups: enableBackups,
            auth: {
                method: authMethod,
                credentials: authMethod === 'password' ? password : sshKey,
            }
        };

        console.log('API Payload for new server:', payload);
        // Simulate API call and redirect
        navigate('/servers');
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

                {/* 2. Operating System */}
                <div className={`${styles['form-section']} animate-enter-d2`}>
                    <h2>2. {t('create_server.section_os')}</h2>
                    <div className={styles['options-grid']} style={{ marginBottom: '16px' }}>
                        <button type="button" className={`${styles['option-card']} ${osClass === 'Ubuntu' ? styles['active'] : ''}`} onClick={() => { setOsClass('Ubuntu'); setOsVersion('22.04 LTS'); }}>
                            <span className="material-symbols-outlined">terminal</span> Ubuntu
                        </button>
                        <button type="button" className={`${styles['option-card']} ${osClass === 'Debian' ? styles['active'] : ''}`} onClick={() => { setOsClass('Debian'); setOsVersion('11'); }}>
                            <span className="material-symbols-outlined">terminal</span> Debian
                        </button>
                        <button type="button" className={`${styles['option-card']} ${osClass === 'CentOS' ? styles['active'] : ''}`} onClick={() => { setOsClass('CentOS'); setOsVersion('8 Stream'); }}>
                            <span className="material-symbols-outlined">terminal</span> CentOS
                        </button>
                    </div>

                    <div className={styles['version-selector']}>
                        <label>{t('create_server.os_version_label')} {osClass}:</label>
                        <select
                            className={styles['select-input']}
                            value={osVersion}
                            onChange={(e) => setOsVersion(e.target.value)}
                        >
                            {osClass === 'Ubuntu' && (
                                <>
                                    <option value="22.04 LTS">22.04 LTS</option>
                                    <option value="20.04 LTS">20.04 LTS</option>
                                    <option value="24.04 LTS">24.04 LTS</option>
                                </>
                            )}
                            {osClass === 'Debian' && (
                                <>
                                    <option value="12">Debian 12</option>
                                    <option value="11">Debian 11</option>
                                    <option value="10">Debian 10</option>
                                </>
                            )}
                            {osClass === 'CentOS' && (
                                <>
                                    <option value="9 Stream">9 Stream</option>
                                    <option value="8 Stream">8 Stream</option>
                                    <option value="7">7.9</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* 3. Tariff Plan (Hardware Presets) */}
                <div className={`${styles['form-section']} animate-enter-d3`}>
                    <h2>3. {t('create_server.section_tariff')}</h2>
                    <div className={styles['tariff-grid']}>
                        {TARIFFS.map(tariff => (
                            <div
                                key={tariff.id}
                                className={`${styles['tariff-card']} ${tariffId === tariff.id ? styles['active'] : ''}`}
                                onClick={() => setTariffId(tariff.id)}
                            >
                                <div className={styles['tariff-name']}>{tariff.name}</div>
                                <div className={styles['tariff-specs']}>
                                    <span>{tariff.cpu} vCPU</span> • <span>{tariff.ram} GB RAM</span> • <span>{tariff.disk} GB NVMe</span>
                                </div>
                                <div className={styles['tariff-price']}>{tariff.price} {t('create_server.price_per_month')}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Settings (Backups, Auth Method, Name) */}
                <div className={`${styles['form-section']} animate-enter-d4`}>
                    <h2>4. {t('create_server.section_access')}</h2>

                    <div className={styles['settings-group']}>
                        <label className={styles['toggle-label']}>
                            <input
                                type="checkbox"
                                className={styles['modern-checkbox']}
                                checked={enableBackups}
                                onChange={(e) => setEnableBackups(e.target.checked)}
                            />
                            <div className={styles['toggle-text']}>
                                <strong>{t('create_server.enable_backups')}</strong>
                                <span>{t('create_server.backups_desc')}</span>
                            </div>
                        </label>
                    </div>

                    <div className={styles['settings-group']}>
                        <label className={styles['input-label']}>{t('create_server.auth_method')}</label>
                        <div className={styles['auth-method-tabs']}>
                            <button
                                type="button"
                                className={authMethod === 'password' ? styles['auth-tab-active'] : styles['auth-tab']}
                                onClick={() => setAuthMethod('password')}
                            >
                                {t('create_server.auth_password')}
                            </button>
                            <button
                                type="button"
                                className={authMethod === 'ssh' ? styles['auth-tab-active'] : styles['auth-tab']}
                                onClick={() => setAuthMethod('ssh')}
                            >
                                {t('create_server.auth_ssh')}
                            </button>
                        </div>

                        {authMethod === 'password' ? (
                            <input
                                type="password"
                                className={styles['text-input']}
                                placeholder={t('create_server.password_placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        ) : (
                            <textarea
                                className={`${styles['text-input']} ${styles['textarea-input']}`}
                                placeholder={t('create_server.ssh_placeholder')}
                                value={sshKey}
                                onChange={(e) => setSshKey(e.target.value)}
                                required
                            />
                        )}
                    </div>

                    <div className={styles['settings-group']}>
                        <label className={styles['input-label']}>{t('create_server.server_name_label')}</label>
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
                <div className={`${styles['form-actions']} animate-enter-d4`}>
                    <button type="button" className={styles['btn-cancel']} onClick={() => navigate('/servers')}>{t('common.cancel')}</button>
                    <button type="submit" className="btn-primary">
                        {t('create_server.title')}
                    </button>
                </div>
            </form>
        </div>
    );
};
