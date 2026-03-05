import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import styles from '../../Styles/PageHeaders.module.css'

export const Backups: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.backups_title')}</h1>
            </div>
            <div className="card animate-enter">
                <h3>{t('pages.backups_subtitle')}</h3>
                <p>{t('pages.backups_desc')}</p>
            </div>
        </div>
    );
};

export const Monitoring: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.monitoring_title')}</h1>
            </div>
            <div className="card animate-enter">
                <h3>{t('pages.monitoring_subtitle')}</h3>
                <p>{t('pages.monitoring_desc')}</p>
            </div>
        </div>
    );
};

export const Traffic: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.traffic_title')}</h1>
            </div>
            <div className="card animate-enter">
                <h3>{t('pages.traffic_subtitle')}</h3>
                <p>{t('pages.traffic_desc')}</p>
            </div>
        </div>
    );
};

export const APIPage: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.api_title')}</h1>
                <button className="btn-primary">
                    {t('pages.api_generate_token')} <span className="material-symbols-outlined">key</span>
                </button>
            </div>
            <div className="card animate-enter">
                <h3>{t('pages.api_subtitle')}</h3>
                <p>{t('pages.api_desc')}</p>
            </div>
        </div>
    );
};

export const QA: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.qa_title')}</h1>
            </div>
            <div className="card animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>{t('pages.qa_q1_title')}</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: t('pages.qa_q1_desc') }}></p>
                </div>
                <div>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>{t('pages.qa_q2_title')}</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: t('pages.qa_q2_desc') }}></p>
                </div>
                <div>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>{t('pages.qa_q3_title')}</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: t('pages.qa_q3_desc') }}></p>
                </div>
            </div>
        </div>
    );
};

export const WhatsNew: React.FC = () => {
    const { t } = useSettings();
    return (
        <div className="page-container">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('pages.whats_new_title')}</h1>
            </div>
            <div className="card animate-enter">
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '32px', borderBottom: '1px solid var(--c-gray-100)', paddingBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--c-red)' }}>new_releases</span>
                            <strong style={{ fontSize: '18px', color: 'var(--c-dark-blue)' }}>{t('pages.whats_new_v5_title')}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--c-gray-500)', marginLeft: 'auto' }}>{t('pages.whats_new_today')}</span>
                        </div>
                        <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.6' }}>
                            {t('pages.whats_new_v5_desc')}
                            <br />- {t('pages.whats_new_v5_global')}
                            <br />- {t('pages.whats_new_v5_server')}
                            <br />- {t('pages.whats_new_v5_billing')}
                            <br />- {t('pages.whats_new_v5_localization')}
                            <br />- {t('pages.whats_new_v5_interface')}
                        </p>
                    </li>
                    <li style={{ marginBottom: '32px', borderBottom: '1px solid var(--c-gray-100)', paddingBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--c-gray-500)' }}>history</span>
                            <strong style={{ fontSize: '18px', color: 'var(--c-dark-blue)' }}>{t('pages.whats_new_v2_title')}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--c-gray-500)', marginLeft: 'auto' }}>{t('pages.whats_new_earlier')}</span>
                        </div>
                        <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.6' }}>
                            {t('pages.whats_new_v2_desc')}
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
};
