import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import './Settings.css';

export const Settings: React.FC = () => {
    const { language, setLanguage, theme, setTheme, t } = useSettings();
    const [twoFactor, setTwoFactor] = useState(false);

    return (
        <div className="page-container settings-page">
            <div className="page-header">
                <h1 className="page-title">{t('profile_settings')}</h1>
            </div>

            <div className="settings-section">
                <h2 className="settings-subtitle">{t('interface_lang')}</h2>
                <div className="language-toggle">
                    <button className={`lang-btn ${language === 'ru' ? 'active' : ''}`} onClick={() => setLanguage('ru')}>Русский</button>
                    <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>English</button>
                </div>
            </div>

            <div className="settings-section">
                <h2 className="settings-subtitle">{t('theme')}</h2>
                <div className="language-toggle">
                    <button className={`lang-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                        {t('theme_light')}
                    </button>
                    <button className={`lang-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                        {t('theme_dark')}
                    </button>
                    <button className={`lang-btn ${theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')}>
                        {t('theme_system')}
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h2 className="settings-subtitle">{t('security_2fa')}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={twoFactor}
                            onChange={(e) => setTwoFactor(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--c-red)' }}
                        />
                        {t('two_factor_auth')}
                    </label>
                    <button className="btn-outline" disabled={!twoFactor}>
                        {t('setup_authenticator')}
                    </button>
                </div>
            </div>
        </div>
    );
};
