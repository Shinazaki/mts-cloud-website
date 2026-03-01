import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateServer.module.css';

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
        <div className={`page-container ${styles['create-server-page']}`}>
            <div className="page-header">
                <div className={styles['header-breadcrumbs']}>
                    <button className={styles['back-btn']} onClick={() => navigate('/servers')}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="page-title">Новый сервер</h1>
                </div>
            </div>

            <form className={styles['create-server-form']} onSubmit={handleCreate}>
                <div className={`${styles['form-section']} animate-enter-d1`}>
                    <h2>Регион</h2>
                    <div className={styles['options-grid']}>
                        <button type="button" className={`${styles['option-card']} ${selectedRegion === 'Moscow' ? styles['active'] : ''}`} onClick={() => setSelectedRegion('Moscow')}>
                            Москва
                        </button>
                        <button type="button" className={`${styles['option-card']} ${selectedRegion === 'Minsk' ? styles['active'] : ''}`} onClick={() => setSelectedRegion('Minsk')}>
                            Минск
                        </button>
                    </div>
                </div>

                <div className={`${styles['form-section']} animate-enter-d2`}>
                    <h2>Операционная система</h2>
                    <div className={styles['options-grid']}>
                        <button type="button" className={`${styles['option-card']} ${selectedOs === 'Ubuntu 22.04' ? styles['active'] : ''}`} onClick={() => setSelectedOs('Ubuntu 22.04')}>
                            <span className="material-symbols-outlined">terminal</span> Ubuntu 22.04
                        </button>
                        <button type="button" className={`${styles['option-card']} ${selectedOs === 'Debian 11' ? styles['active'] : ''}`} onClick={() => setSelectedOs('Debian 11')}>
                            <span className="material-symbols-outlined">terminal</span> Debian 11
                        </button>
                        <button type="button" className={`${styles['option-card']} ${selectedOs === 'CentOS 8' ? styles['active'] : ''}`} onClick={() => setSelectedOs('CentOS 8')}>
                            <span className="material-symbols-outlined">terminal</span> CentOS 8
                        </button>
                    </div>
                </div>

                <div className={`${styles['form-section']} animate-enter-d3`}>
                    <h2>Название сервера</h2>
                    <input
                        type="text"
                        className={styles['text-input']}
                        placeholder="Введите название"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        required
                    />
                </div>

                <div className={`${styles['form-actions']} animate-enter-d4`}>
                    <button type="button" className={styles['btn-cancel']} onClick={() => navigate('/servers')}>Отмена</button>
                    <button type="submit" className="btn-primary">Создать сервер</button>
                </div>
            </form>
        </div>
    );
};
