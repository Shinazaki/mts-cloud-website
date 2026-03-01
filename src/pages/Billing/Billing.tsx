import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Billing.module.css';

export const Billing: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'history' | 'settings'>('general');
    const [cards, setCards] = useState<{ id: string, number: string, expires: string }[]>([
        { id: '1', number: 'Mastercard ending in 1234', expires: '12/25' }
    ]);
    const [paymentDetails, setPaymentDetails] = useState({
        name: 'Иван Иванов',
        address: 'ул. Примерная, д. 1, кв. 2',
        zip: '220000'
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleAddCard = () => {
        const newCard = {
            id: Date.now().toString(),
            number: `Visa ending in ${Math.floor(1000 + Math.random() * 9000)}`,
            expires: `12/${Math.floor(26 + Math.random() * 5)}`
        };
        setCards([...cards, newCard]);
    };

    const handleRemoveCard = (id: string) => {
        setCards(cards.filter(c => c.id !== id));
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Данные успешно сохранены!');
        }, 800);
    };

    return (
        <div className={`page-container ${styles['billing-page']}`}>
            <div className="page-header">
                <h1 className="page-title">Счета и оплата</h1>
                <button className="btn-primary">
                    Сделать платёж <span className="material-symbols-outlined">expand_more</span>
                </button>
            </div>

            <div className={styles['tabs-container']}>
                <div className={styles['tabs-header']}>
                    <button
                        className={`${styles['tab-btn']} ${activeTab === 'general' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        Общее
                    </button>
                    <button
                        className={`${styles['tab-btn']} ${activeTab === 'history' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        История
                    </button>
                    <button
                        className={`${styles['tab-btn']} ${activeTab === 'settings' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Настройки оплаты
                    </button>
                </div>
                <div className={styles['tab-divider']}></div>

                <div className={styles['tab-content']} style={{ position: 'relative', minHeight: '400px' }}>
                    <AnimatePresence mode="wait" initial={false}>
                        {activeTab === 'general' && (
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className={styles['billing-card']}
                            >
                                <div className={styles['billing-main-info']}>
                                    <div className={styles['balance-label']}>Баланс на текущий месяц</div>
                                    <div className={styles['balance-amount']}>42.00 BYN</div>
                                </div>

                                <div className={styles['billing-details']}>
                                    <div className={styles['detail-item']}>
                                        <span className={styles['detail-label']}>Следующий платёж:</span>
                                        <span className={styles['detail-value']}>Когда-то там</span>
                                    </div>
                                    <div className={styles['detail-item']}>
                                        <span className={styles['detail-label']}>Уже внесённые средства:</span>
                                        <span className={styles['detail-value']}>Сколько-то</span>
                                    </div>
                                    <div className={styles['detail-item']}>
                                        <span className={styles['detail-label']}>Итоговое использование:</span>
                                        <span className={styles['detail-value']}>Сколько-то</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'history' && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className={styles['placeholder-content']}
                            >
                                <h3>История оплат</h3>
                                <p>Здесь будет отображаться история транзакций.</p>
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className={styles['billing-settings-form']}
                            >
                            <h2 style={{ fontSize: '20px', color: 'var(--c-dark-blue)', marginBottom: '24px' }}>Платежные данные</h2>

                            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }} onSubmit={handleSaveSettings}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-gray-600)', fontWeight: 'bold' }}>ФИО владельца</label>
                                    <input type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', backgroundColor: 'var(--c-white)', color: 'var(--c-gray-900)' }} placeholder="Иван Иванов" value={paymentDetails.name} onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })} required />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-gray-600)', fontWeight: 'bold' }}>Адрес выставления счета</label>
                                    <input type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', backgroundColor: 'var(--c-white)', color: 'var(--c-gray-900)' }} placeholder="ул. Примерная, д. 1, кв. 2" value={paymentDetails.address} onChange={e => setPaymentDetails({ ...paymentDetails, address: e.target.value })} required />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-gray-600)', fontWeight: 'bold' }}>Почтовый индекс</label>
                                    <input type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', backgroundColor: 'var(--c-white)', color: 'var(--c-gray-900)' }} placeholder="220000" value={paymentDetails.zip} onChange={e => setPaymentDetails({ ...paymentDetails, zip: e.target.value })} required />
                                </div>

                                <h3 style={{ fontSize: '18px', color: 'var(--c-dark-blue)', marginTop: '16px', marginBottom: '8px' }}>Привязанные карты</h3>

                                {cards.map(card => (
                                    <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid var(--c-gray-300)', borderRadius: '8px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--c-dark-blue)' }}>credit_card</span>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--c-dark-blue)' }}>{card.number}</div>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveCard(card.id)} className="btn-outline" style={{ marginLeft: 'auto', color: 'var(--c-bright-red)', borderColor: 'var(--c-bright-red)' }}>Удалить</button>
                                    </div>
                                ))}

                                {cards.length === 0 && (
                                    <p style={{ color: 'var(--c-gray-500)', fontStyle: 'italic' }}>Нет привязанных карт.</p>
                                )}

                                <button type="button" onClick={handleAddCard} className="btn-outline" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-symbols-outlined">add</span> Добавить карту
                                </button>

                                <hr style={{ border: 'none', borderTop: '1px solid var(--c-gray-300)', margin: '16px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-primary" disabled={isSaving}>
                                        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
