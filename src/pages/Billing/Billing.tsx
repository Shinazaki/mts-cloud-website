import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import styles from './Billing.module.css';
import headerStyles from '../../Styles/PageHeaders.module.css'

export const Billing: React.FC = () => {
    const { t } = useSettings();
    const [activeTab, setActiveTab] = useState<'general' | 'history' | 'settings'>('general');
    const [cards, setCards] = useState<{ id: string, number: string, expires: string }[]>([
        { id: '1', number: 'Mastercard ending in 1234', expires: '12/25' }
    ]);
    const [paymentDetails, setPaymentDetails] = useState({
        name: '',
        address: '',
        zip: ''
    });
    const [balance, setBalance] = useState<string>('0.00');
    const [nextPaymentDate, setNextPaymentDate] = useState<string>('');
    const [alreadyPaid, setAlreadyPaid] = useState<string>('0.00');
    const [totalUsage, setTotalUsage] = useState<string>('0.00');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBillingData = async () => {
            setIsLoading(true);
            try {
                const [balRes, profRes] = await Promise.all([
                    api.billing.getBalance(),
                    api.users.getProfile()
                ]);

                if (balRes.data && balRes.data.balance !== undefined) {
                    const currentBalance = Number(balRes.data.balance).toFixed(2);
                    setBalance(currentBalance);
                    
                    // Calculate next payment date (first day of next month)
                    const today = new Date();
                    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                    const formatter = new Intl.DateTimeFormat('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit' 
                    });
                    setNextPaymentDate(formatter.format(nextMonth));
                    
                    // Set already paid to current balance (amount already on account)
                    setAlreadyPaid(currentBalance);
                    
                    // Calculate total usage (example: 40% of the current balance)
                    const usage = (parseFloat(currentBalance) * 0.4).toFixed(2);
                    setTotalUsage(usage);
                }

                if (profRes.data) {
                    setPaymentDetails({
                        name: profRes.data.firstName || profRes.data.name || '',
                        address: profRes.data.address || '',
                        zip: profRes.data.zip || ''
                    });
                }
            } catch (err) {
                console.error("Failed to load billing details", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBillingData();
    }, []);

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

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.users.updateProfile({
                firstName: paymentDetails.name,
                address: paymentDetails.address,
                zip: paymentDetails.zip
            });
            alert(t('billing.save_success'));
        } catch (err) {
            alert(t('billing.save_error'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`page-container ${styles['billing-page']}`}>
            <div className={headerStyles.pageHeader}>
                <h1 className={headerStyles.pageTitle}>{t('billing.title')}</h1>
                <button className="btn-primary">
                    {t('billing.make_payment')} <span className="material-symbols-outlined">expand_more</span>
                </button>
            </div>

            <div className={styles['tabs-container']}>
                <div className={styles['tabs-header']}>
                    <button
                        className={`${styles['tab-btn']} ${activeTab === 'general' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        {t('billing.tab_general')}
                    </button>
                    <button
                        className={`${styles['tab-btn']} ${activeTab === 'history' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        {t('billing.tab_history')}
                    </button>
                    <button
                        className={`${styles['tab-btn']} ${activeTab === 'settings' ? styles['active'] : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        {t('billing.tab_settings')}
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
                                    <div className={styles['balance-label']}>{t('billing.balance_label')}</div>
                                    <div className={styles['balance-amount']}>{isLoading ? '...' : balance} BYN</div>
                                </div>

                                <div className={styles['billing-details']}>
                                    <div className={styles['detail-item']}>
                                        <span className={styles['detail-label']}>{t('billing.next_payment')}</span>
                                        <span className={styles['detail-value']}>{isLoading ? '...' : nextPaymentDate}</span>
                                    </div>
                                    <div className={styles['detail-item']}>
                                        <span className={styles['detail-label']}>{t('billing.already_paid')}</span>
                                        <span className={styles['detail-value']}>{isLoading ? '...' : alreadyPaid} BYN</span>
                                    </div>
                                    <div className={styles['detail-item']}>
                                        <span className={styles['detail-label']}>{t('billing.total_usage')}</span>
                                        <span className={styles['detail-value']}>{isLoading ? '...' : totalUsage} BYN</span>
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
                                <h3>{t('billing.history_title')}</h3>
                                <p>{t('billing.history_placeholder')}</p>
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
                                <h2 style={{ fontSize: '20px', color: 'var(--c-dark-blue)', marginBottom: '24px' }}>{t('billing.payment_details')}</h2>

                                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }} onSubmit={handleSaveSettings}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-gray-600)', fontWeight: 'bold' }}>{t('billing.owner_name')}</label>
                                        <input type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', backgroundColor: 'var(--c-white)', color: 'var(--c-gray-900)' }} placeholder="Иван Иванов" value={paymentDetails.name} onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })} required />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-gray-600)', fontWeight: 'bold' }}>{t('billing.billing_address')}</label>
                                        <input type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', backgroundColor: 'var(--c-white)', color: 'var(--c-gray-900)' }} placeholder="ул. Примерная, д. 1, кв. 2" value={paymentDetails.address} onChange={e => setPaymentDetails({ ...paymentDetails, address: e.target.value })} required />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-gray-600)', fontWeight: 'bold' }}>{t('billing.postal_code')}</label>
                                        <input type="text" style={{ width: '100%', padding: '12px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', backgroundColor: 'var(--c-white)', color: 'var(--c-gray-900)' }} placeholder="220000" value={paymentDetails.zip} onChange={e => setPaymentDetails({ ...paymentDetails, zip: e.target.value })} required />
                                    </div>

                                    <h3 style={{ fontSize: '18px', color: 'var(--c-dark-blue)', marginTop: '16px', marginBottom: '8px' }}>{t('billing.linked_cards')}</h3>

                                    {cards.map(card => (
                                        <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid var(--c-gray-300)', borderRadius: '8px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--c-dark-blue)' }}>credit_card</span>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: 'var(--c-dark-blue)' }}>{card.number}</div>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveCard(card.id)} className="btn-outline" style={{ marginLeft: 'auto', color: 'var(--c-bright-red)', borderColor: 'var(--c-bright-red)' }}>{t('billing.delete_card')}</button>
                                        </div>
                                    ))}

                                    {cards.length === 0 && (
                                        <p style={{ color: 'var(--c-gray-500)', fontStyle: 'italic' }}>{t('billing.no_cards')}</p>
                                    )}

                                    <button type="button" onClick={handleAddCard} className="btn-outline" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-symbols-outlined">add</span> {t('billing.add_card')}
                                    </button>

                                    <hr style={{ border: 'none', borderTop: '1px solid var(--c-gray-300)', margin: '16px 0' }} />

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn-primary" disabled={isSaving}>
                                            {isSaving ? t('billing.saving') : t('billing.save_changes')}
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
