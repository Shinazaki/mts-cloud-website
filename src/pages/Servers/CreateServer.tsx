import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateServer.css';

export const CreateServer: React.FC = () => {
    const navigate = useNavigate();
    const [serverName, setServerName] = useState('');
    const [selectedOs, setSelectedOs] = useState('Ubuntu 22.04');
    const [selectedRegion, setSelectedRegion] = useState('Moscow');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call for creation
        console.log('Creating server', { serverName, selectedOs, selectedRegion });
        navigate('/servers');
    };

    return (
        <div className="page-container create-server-page">
            <div className="page-header">
                <div className="header-breadcrumbs">
                    <button className="back-btn" onClick={() => navigate('/servers')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="page-title">Новый сервер</h1>
                </div>
            </div>

            <form className="create-server-form" onSubmit={handleCreate}>
                <div className="form-section">
                    <h2>Регион</h2>
                    <div className="options-grid">
                        <button type="button" className={`option-card ${selectedRegion === 'Moscow' ? 'active' : ''}`} onClick={() => setSelectedRegion('Moscow')}>
                            Москва
                        </button>
                        <button type="button" className={`option-card ${selectedRegion === 'Minsk' ? 'active' : ''}`} onClick={() => setSelectedRegion('Minsk')}>
                            Минск
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Операционная система</h2>
                    <div className="options-grid">
                        <button type="button" className={`option-card ${selectedOs === 'Ubuntu 22.04' ? 'active' : ''}`} onClick={() => setSelectedOs('Ubuntu 22.04')}>
                            <span className="material-symbols-outlined">terminal</span> Ubuntu 22.04
                        </button>
                        <button type="button" className={`option-card ${selectedOs === 'Debian 11' ? 'active' : ''}`} onClick={() => setSelectedOs('Debian 11')}>
                            <span className="material-symbols-outlined">terminal</span> Debian 11
                        </button>
                        <button type="button" className={`option-card ${selectedOs === 'CentOS 8' ? 'active' : ''}`} onClick={() => setSelectedOs('CentOS 8')}>
                            <span className="material-symbols-outlined">terminal</span> CentOS 8
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Название сервера</h2>
                    <input
                        type="text"
                        className="text-input"
                        placeholder="Введите название"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/servers')}>Отмена</button>
                    <button type="submit" className="btn-primary">Создать сервер</button>
                </div>
            </form>
        </div>
    );
};
