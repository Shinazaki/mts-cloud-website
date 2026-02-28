import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import './Servers.css';

export const ServerConfig: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useSettings();

    // Mock server data
    const [server, setServer] = useState({
        id: id || '1',
        name: 'WebProd-Node-01',
        cpu: '2',
        ram: '4',
        disk: '60'
    });

    const [isSaving, setIsSaving] = useState(false);

    const cpuOptions = ['1', '2', '4', '8', '16', '32'];
    const ramOptions = ['1', '2', '4', '8', '16', '32', '64'];
    const diskOptions = ['20', '40', '60', '100', '200', '500', '1000'];

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert(t('settings_saved') || 'Изменения сохранены!');
            navigate('/servers');
        }, 800);
    };

    return (
        <div className="page-container server-config-page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-icon" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--c-dark-blue)' }}>arrow_back</span>
                    </button>
                    <h1 className="page-title">Изменение конфигурации</h1>
                </div>
            </div>

            <div className="billing-card" style={{ maxWidth: '800px', padding: '40px', marginTop: '24px' }}>
                <h2 style={{ marginBottom: '32px', color: 'var(--c-dark-blue)' }}>{server.name}</h2>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="form-group">
                        <label style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--c-gray-600)' }}>Процессор (CPU)</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={server.cpu}
                                onChange={e => setServer({ ...server, cpu: e.target.value })}
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
                        <label style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--c-gray-600)' }}>Оперативная память (RAM)</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={server.ram}
                                onChange={e => setServer({ ...server, ram: e.target.value })}
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
                                    <option key={opt} value={opt}>{opt} GB</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--c-gray-400)' }}>expand_more</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--c-gray-600)' }}>Накопитель (Disk)</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={server.disk}
                                onChange={e => setServer({ ...server, disk: e.target.value })}
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
                        <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
                            {t('cancel')}
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSaving} style={{ padding: '12px 32px' }}>
                            {isSaving ? 'Применяем...' : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
