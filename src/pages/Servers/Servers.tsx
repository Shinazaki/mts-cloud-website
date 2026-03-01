import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import styles from './Servers.module.css';

interface Server {
    id: string;
    name: string;
    characteristics: string;
    ip: string;
    created: string;
    osIcon: string;
}

export const Servers: React.FC = () => {
    const { data: serversResponse, isLoading, isError } = useQuery({
        queryKey: ['servers'],
        queryFn: api.servers.getAll,
    });

    // Local override for UI actions (edit/delete) while backend write endpoints are not wired yet
    const [localServers, setLocalServers] = useState<Server[] | null>(null);
    const sourceServers = (serversResponse?.data as Server[] | undefined) ?? [];
    const servers = localServers ?? sourceServers;

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
            setLocalServers(servers.filter(s => s.id !== id));
        }
    };

    const handleSimulate = (action: string) => {
        alert(`Интерактивное действие: ${action}\n(Заглушка, пока нет интеграции с бэкендом)`);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingServer) {
            setLocalServers(servers.map(s => s.id === editingServer.id ? editingServer : s));
            setEditingServer(null);
        }
    };

    return (
        <div className={styles['page-container'] + " " + styles['servers-page']}>
            <div className={styles['page-header']}>
                <h1 className={styles['page-title']}>{t('servers')}</h1>
                <button className={styles['btn-primary']} onClick={() => navigate('/servers/create')}>
                    {t('create_server')} <span className="material-symbols-outlined">add</span>
                </button>
            </div>

            <div className={styles['search-container']}>
                <input
                    type="text"
                    className={styles['search-input']}
                    placeholder="Найти сервер по названию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading && <div style={{ padding: '20px' }}>Загрузка серверов...</div>}
            {isError && <div style={{ padding: '20px', color: 'red' }}>Ошибка при загрузке серверов.</div>}

            {!isLoading && !isError && (
                <div className={styles['table-container']}>
                    <table className={styles['data-table']}>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>IP Adress</th>
                                <th>Создан</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence initial={false}>
                            {filteredServers.length === 0 ? (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>Серверы не найдены</td></motion.tr>
                            ) : filteredServers.map((server, i) => (
                                <motion.tr 
                                    key={server.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                >
                                    <td>
                                        <div className={styles['server-name-cell']}>
                                            <div className={styles['server-icon-wrapper']}>
                                                <span className={`material-symbols-outlined ${styles['server-icon']}`}>{server.osIcon}</span>
                                            </div>
                                            <div onClick={() => navigate(`/servers/${server.id}`)} style={{ cursor: 'pointer' }}>
                                                <div className={styles['server-name']}>{server.name}</div>
                                                <div className={styles['server-characteristics']}>{server.characteristics}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{server.ip}</td>
                                    <td>{server.created}</td>
                                    <td className={styles['actions-cell']} style={{ position: 'relative' }}>
                                        <button
                                            className={styles['btn-outline']}
                                            onClick={(e) => { e.stopPropagation(); navigate(`/servers/${server.id}/config`); }}
                                        >
                                            Расширить
                                        </button>
                                        <button
                                            className={styles['btn-ghost']}
                                            onClick={(e) => handleActionClick(e, server.id)}
                                        >
                                            Ещё <span className="material-symbols-outlined">expand_more</span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                        {openDropdownId === server.id && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className={styles['row-action-dropdown']}
                                            >
                                                <button onClick={() => handleSimulate('Доступ к терминалу')}>Доступ к терминалу</button>
                                                <button onClick={() => handleSimulate('Посмотреть использование')}>Использование ресурсов</button>
                                                <button className={styles['danger-text']} onClick={() => handleDestroy(server.id, server.name)}>Уничтожить</button>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>
                                    </td>
                                </motion.tr>
                            ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}

            {editingServer && (
                <div className={styles['modal-overlay']} onClick={() => setEditingServer(null)}>
                    <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                        <div className={styles['modal-header']}>
                            <h2>{t('edit_server')}</h2>
                            <button className={styles['close-btn']} onClick={() => setEditingServer(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className={styles['edit-server-form']}>
                            <div className={styles['form-group']}>
                                <label>{t('server_name_label')}</label>
                                <input
                                    type="text"
                                    value={editingServer.name}
                                    onChange={e => setEditingServer({ ...editingServer, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>{t('characteristics_label')}</label>
                                <textarea
                                    value={editingServer.characteristics}
                                    onChange={e => setEditingServer({ ...editingServer, characteristics: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles['modal-actions']}>
                                <button type="button" className={styles['btn-outline']} onClick={() => setEditingServer(null)}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className={styles['btn-primary']}>
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
