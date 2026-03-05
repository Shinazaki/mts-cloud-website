import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useSettings } from '../../hooks/useSettings';
import type { Ticket } from '../../types/auth';
import styles from '../../Styles/PageHeaders.module.css';

export const Support: React.FC = () => {
    const { t } = useSettings();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { data: ticketsRes, isLoading } = useQuery({
        queryKey: ['tickets'],
        queryFn: api.tickets.getAll,
    });

    const tickets: Ticket[] = (ticketsRes?.data as Ticket[] | undefined) ?? [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubject.trim()) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            await api.tickets.create({ subject: newSubject.trim(), message: newMessage.trim() });
            await queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setIsCreating(false);
            setNewSubject('');
            setNewMessage('');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: unknown } } };
            const raw = axiosErr.response?.data?.message;
            const text = Array.isArray(raw) ? (raw as string[]).join(', ') : (typeof raw === 'string' ? raw : 'Ошибка отправки тикета');
            setSubmitError(text);
            console.error('Failed to create ticket', axiosErr.response?.data ?? err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('support.title')}</h1>
                {!isCreating && (
                    <button className="btn-primary" onClick={() => setIsCreating(true)}>
                        {t('support.create_ticket')} <span className="material-symbols-outlined">add</span>
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait" initial={false}>
                {isCreating ? (
                    <motion.form key="create" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} onSubmit={handleSubmit} className="card" style={{ maxWidth: '800px' }}>
                        <h2 style={{ marginBottom: '24px', color: 'var(--c-dark-blue)' }}>{t('support.new_ticket_title')}</h2>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-dark-blue)', fontWeight: 'bold' }}>{t('support.subject_label')}</label>
                            <input
                                type="text"
                                style={{ width: '100%', padding: '14px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                required
                                placeholder={t('support.subject_placeholder')}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--c-dark-blue)', fontWeight: 'bold' }}>{t('support.description_label')}</label>
                            <textarea
                                style={{ width: '100%', padding: '14px', border: '1px solid var(--c-gray-300)', borderRadius: '8px', fontSize: '16px', minHeight: '120px', outline: 'none', resize: 'vertical' }}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                required
                                placeholder={t('support.description_placeholder')}
                            />
                        </div>

                        {submitError && (
                            <p style={{ color: 'var(--c-bright-red)', fontSize: '13px', margin: '0 0 12px' }}>⚠ {submitError}</p>
                        )}
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button type="button" className="btn-outline" onClick={() => setIsCreating(false)}>{t('common.cancel')}</button>
                            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? t('common.saving') : t('support.submit')}</button>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card">
                        <h2 style={{ marginBottom: '24px', color: 'var(--c-dark-blue)' }}>{t('support.your_tickets')}</h2>
                        {isLoading ? (
                            <p style={{ color: 'var(--c-gray-600)' }}>{t('servers.loading')}</p>
                        ) : tickets.length === 0 ? (
                            <p style={{ color: 'var(--c-gray-600)' }}>{t('support.no_tickets')}</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {tickets.map(ticket => (
                                    <li key={ticket.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--c-gray-200)' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--c-dark-blue)' }}>{ticket.subject}</span>
                                        <span style={{ color: 'var(--c-red)', backgroundColor: '#FEF2F2', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold' }}>
                                            {ticket.status ?? t('support.status_open')}
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
