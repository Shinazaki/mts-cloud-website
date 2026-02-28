import React, { useState } from 'react';

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

            {isCreating ? (
                <form onSubmit={handleSubmit} className="content-card" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', border: '1px solid var(--c-gray-300)' }}>
                    <h2 style={{ marginBottom: '24px', color: 'var(--c-dark-blue)' }}>Новое обращение</h2>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-dark-blue)', fontWeight: 'bold' }}>Тема</label>
                        <input
                            type="text"
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px' }}
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                            placeholder="Кратко опишите проблему"
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-dark-blue)', fontWeight: 'bold' }}>Описание</label>
                        <textarea
                            style={{ width: '100%', padding: '12px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', minHeight: '120px' }}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            required
                            placeholder="Подробное описание проблемы..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button type="button" className="btn-cancel" onClick={() => setIsCreating(false)}>Отмена</button>
                        <button type="submit" className="btn-primary">Отправить</button>
                    </div>
                </form>
            ) : (
                <div className="content-card" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', border: '1px solid var(--c-gray-300)' }}>
                    <h2 style={{ marginBottom: '24px', color: 'var(--c-dark-blue)' }}>Ваши обращения</h2>
                    {tickets.length === 0 ? (
                        <p style={{ color: 'var(--c-gray-600)' }}>У вас пока нет открытых тикетов в службу поддержки. Мы всегда рады помочь!</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {tickets.map(ticket => (
                                <li key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--c-gray-200)' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--c-dark-blue)' }}>{ticket.title}</span>
                                    <span style={{ color: 'var(--c-red)', backgroundColor: '#FEF2F2', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {ticket.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
