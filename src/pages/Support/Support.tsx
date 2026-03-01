import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Support: React.FC = () => {
    const [tickets, setTickets] = useState<{ id: number, title: string, status: string }[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setTickets([...tickets, { id: Date.now(), title: newTitle, status: 'Открыт' }]);
        setIsCreating(false);
        setNewTitle('');
        setNewDescription('');
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Поддержка</h1>
                {!isCreating && (
                    <button className="btn-primary" onClick={() => setIsCreating(true)}>
                        Создать тикет <span className="material-symbols-outlined">add</span>
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait" initial={false}>
                {isCreating ? (
                    <motion.form key="create" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px' }}>
                        <h2 style={{ marginBottom: '24px', color: 'var(--c-dark-blue)' }}>Новое обращение</h2>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-dark-blue)', fontWeight: 'bold' }}>Тема</label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '14px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                                placeholder="Кратко опишите проблему"
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-dark-blue)', fontWeight: 'bold' }}>Описание</label>
                            <textarea
                                style={{ width: '100%', padding: '14px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', minHeight: '120px', outline: 'none', resize: 'vertical' }}
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                required
                                placeholder="Подробное описание проблемы..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button type="button" className="btn-outline" onClick={() => setIsCreating(false)}>Отмена</button>
                            <button type="submit" className="btn-primary">Отправить</button>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card">
                        <h2 style={{ marginBottom: '24px', color: 'var(--c-dark-blue)' }}>Ваши обращения</h2>
                        {tickets.length === 0 ? (
                            <p style={{ color: 'var(--c-gray-600)' }}>У вас пока нет открытых тикетов в службу поддержки. Мы всегда рады помочь!</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {tickets.map(ticket => (
                                    <li key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--c-gray-200)' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--c-dark-blue)' }}>{ticket.title}</span>
                                        <span style={{ color: 'var(--c-red)', backgroundColor: '#FEF2F2', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold' }}>
                                            {ticket.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
