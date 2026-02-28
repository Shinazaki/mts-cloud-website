import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import './Servers.css';

interface Server {
    id: string;
    name: string;
    characteristics: string;
    ip: string;
    created: string;
    osIcon: string;
}

const INITIAL_SERVERS: Server[] = [
    {
        id: '1',
        name: 'WebProd-Node-01',
        characteristics: '2 CPU, 4 GB RAM, 60 GB NVMe',
        ip: '192.168.0.100',
        created: '12.10.2023',
        osIcon: 'terminal'
    },
    {
        id: '2',
        name: 'Database-Primary',
        characteristics: '8 CPU, 32 GB RAM, 500 GB SSD',
        ip: '10.0.0.5',
        created: '05.11.2023',
        osIcon: 'dns'
    }
];

export const Servers: React.FC = () => {
    const [servers, setServers] = useState<Server[]>(INITIAL_SERVERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [editingServer, setEditingServer] = useState<Server | null>(null);
    const navigate = useNavigate();
    const { t } = useSettings();

    // Quick handle outside clicks for dropdowns
    useEffect(() => {
        const handleClick = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const filteredServers = servers.filter(
        s => s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleActionClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const handleDestroy = (id: string, name: string) => {
        if (window.confirm(`Вы уверены, что хотите уничтожить сервер "${name}"? Это действие необратимо.`)) {
            setServers(servers.filter(s => s.id !== id));
        }
    };

    const handleSimulate = (action: string) => {
        alert(`Интерактивное действие: ${action}\n(Заглушка, пока нет интеграции с бэкендом)`);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingServer) {
            setServers(servers.map(s => s.id === editingServer.id ? editingServer : s));
            setEditingServer(null);
        }
    };

    return (
        <div className="page-container servers-page">
            <div className="page-header">
                <h1 className="page-title">{t('servers')}</h1>
                <button className="btn-primary" onClick={() => navigate('/servers/create')}>
                    {t('create_server')} <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Найти сервер по названию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th>IP Adress</th>
                            <th>Создан</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServers.length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>Серверы не найдены</td></tr>
                        ) : filteredServers.map(server => (
                            <tr key={server.id}>
                                <td>
                                    <div className="server-name-cell">
                                        <div className="server-icon-wrapper">
                                            <span className="material-symbols-outlined server-icon">{server.osIcon}</span>
                                        </div>
                                        <div onClick={() => navigate(`/servers/${server.id}`)} style={{ cursor: 'pointer' }}>
                                            <div className="server-name">{server.name}</div>
                                            <div className="server-characteristics">{server.characteristics}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{server.ip}</td>
                                <td>{server.created}</td>
                                <td className="actions-cell" style={{ position: 'relative' }}>
                                    <button
                                        className="btn-outline"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/servers/${server.id}/config`); }}
                                    >
                                        Расширить
                                    </button>
                                    <button
                                        className="btn-ghost"
                                        onClick={(e) => handleActionClick(e, server.id)}
                                    >
                                        Ещё <span className="material-symbols-outlined">expand_more</span>
                                    </button>

                                    {openDropdownId === server.id && (
                                        <div className="row-action-dropdown">
                                            <button onClick={() => handleSimulate('Доступ к терминалу')}>Доступ к терминалу</button>
                                            <button onClick={() => handleSimulate('Посмотреть использование')}>Использование ресурсов</button>
                                            <button className="danger-text" onClick={() => handleDestroy(server.id, server.name)}>Уничтожить</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingServer && (
                <div className="modal-overlay" onClick={() => setEditingServer(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('edit_server')}</h2>
                            <button className="close-btn" onClick={() => setEditingServer(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="edit-server-form">
                            <div className="form-group">
                                <label>{t('server_name_label')}</label>
                                <input
                                    type="text"
                                    value={editingServer.name}
                                    onChange={e => setEditingServer({ ...editingServer, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('characteristics_label')}</label>
                                <textarea
                                    value={editingServer.characteristics}
                                    onChange={e => setEditingServer({ ...editingServer, characteristics: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={() => setEditingServer(null)}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className="btn-primary">
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
