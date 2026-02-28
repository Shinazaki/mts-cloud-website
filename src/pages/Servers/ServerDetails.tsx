import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import './Servers.css';

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
        <div className="page-container server-details-page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-icon" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="page-title">{server.name}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-outline" onClick={() => alert('Restarting...')}>
                        <span className="material-symbols-outlined">restart_alt</span>
                    </button>
                    <button className="btn-primary">
                        {t('configuration')}
                    </button>
                </div>
            </div>

            <div className="server-details-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
                <div className="details-main">
                    <div className="info-card" style={{ background: 'var(--c-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--c-gray-200)' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--c-dark-blue)' }}>Общая информация</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="info-item">
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-gray-500)', marginBottom: '4px' }}>IP Adress</label>
                                <span style={{ fontWeight: 600 }}>{server.ip}</span>
                            </div>
                            <div className="info-item">
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-gray-500)', marginBottom: '4px' }}>OC</label>
                                <span style={{ fontWeight: 600 }}>{server.os}</span>
                            </div>
                            <div className="info-item">
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-gray-500)', marginBottom: '4px' }}>Статус</label>
                                <span style={{ color: '#10B981', fontWeight: 600 }}>● {server.status}</span>
                            </div>
                            <div className="info-item">
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-gray-500)', marginBottom: '4px' }}>Аптайм</label>
                                <span style={{ fontWeight: 600 }}>{server.uptime}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-card" style={{ background: 'var(--c-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--c-gray-200)', marginTop: '24px' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--c-dark-blue)' }}>Конфигурация</h3>
                        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{server.characteristics}</p>
                    </div>
                </div>

                <div className="details-sidebar">
                    <div className="info-card" style={{ background: 'var(--c-white)', padding: '24px', borderRadius: '16px', border: '1px solid var(--c-gray-200)' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--c-dark-blue)' }}>История изменений</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontSize: '14px' }}>
                                <div style={{ fontWeight: 600 }}>Создание сервера</div>
                                <div style={{ color: 'var(--c-gray-500)' }}>{server.created}</div>
                            </div>
                            <div style={{ fontSize: '14px' }}>
                                <div style={{ fontWeight: 600 }}>Обновление конфигурации</div>
                                <div style={{ color: 'var(--c-gray-500)' }}>15.11.2023</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
