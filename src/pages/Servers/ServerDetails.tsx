import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import styles from './Servers.module.css';

export const ServerDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    // In a real app, we would fetch server by ID
    const server = {
        id: id || '1',
        name: 'WebProd-Node-01',
        characteristics: '2 CPU, 4 GB RAM, 60 GB NVMe',
        ip: '192.168.0.100',
        created: '12.10.2023',
        status: 'Running',
        uptime: '45 days, 12 hours',
        os: 'Ubuntu 22.04 LTS'
    };

    return (
        <div className={styles['page-container']}>
            <div className={styles['page-header']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className={styles['btn-outline']} onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className={styles['page-title']}>{server.name}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className={styles['btn-outline']} onClick={() => alert('Restarting...')}>
                        <span className="material-symbols-outlined">restart_alt</span>
                    </button>
                    <button className={styles['btn-primary']}>
                        {t('configuration')}
                    </button>
                </div>
            </div>

            <div className="server-details-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
                <div className="details-main">
                    <div className="card animate-enter">
                        <h3 style={{ marginBottom: '20px', color: 'var(--c-dark-blue)' }}>Общая информация</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="info-item">
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--c-gray-500)', marginBottom: '4px' }}>IP Adress</label>
                                <span style={{ fontWeight: 600 }}>{server.ip}</span>
                            </div>
                            <div className="info-item">
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--c-gray-500)', marginBottom: '4px' }}>OC</label>
                                <span style={{ fontWeight: 600 }}>{server.os}</span>
                            </div>
                            <div className="info-item">
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--c-gray-500)', marginBottom: '4px' }}>Статус</label>
                                <span style={{ color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                                    {server.status}
                                </span>
                            </div>
                            <div className="info-item">
                                <label style={{ display: 'block', fontSize: '13px', color: 'var(--c-gray-500)', marginBottom: '4px' }}>Аптайм</label>
                                <span style={{ fontWeight: 600 }}>{server.uptime}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-enter-d1">
                        <h3 style={{ marginBottom: '20px', color: 'var(--c-dark-blue)' }}>Конфигурация</h3>
                        <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{server.characteristics}</p>
                    </div>
                </div>

                <div className="details-sidebar">
                    <div className="card animate-enter-d2">
                        <h3 style={{ marginBottom: '20px', color: 'var(--c-dark-blue)' }}>История изменений</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ fontSize: '14px', borderLeft: '2px solid var(--c-red)', paddingLeft: '12px' }}>
                                <div style={{ fontWeight: 600 }}>Создание сервера</div>
                                <div style={{ color: 'var(--c-gray-500)', marginTop: '4px', fontSize: '12px' }}>{server.created}</div>
                            </div>
                            <div style={{ fontSize: '14px', borderLeft: '2px solid var(--c-gray-300)', paddingLeft: '12px' }}>
                                <div style={{ fontWeight: 600 }}>Обновление конфигурации</div>
                                <div style={{ color: 'var(--c-gray-500)', marginTop: '4px', fontSize: '12px' }}>15.11.2023</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
