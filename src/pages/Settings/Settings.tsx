import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../api/client';
import styles from './Settings.module.css';

type ActiveTab = 'profile' | 'activity';
type ModalType = 'profile' | 'password';

interface ConfirmModal {
    open: boolean;
    type: ModalType;
    currentPassword: string;
    loading: boolean;
    error: string;
}

export const Settings: React.FC = () => {
    const { language, setLanguage, theme, setTheme, t } = useSettings();
    const { user, logout, updateUser } = useAuth();

    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

    // ── Profile form (fields only, no password) ──
    const [profileForm, setProfileForm] = useState({
        firstName:   user?.firstName   ?? '',
        lastName:    user?.lastName    ?? '',
        surName:     user?.surName     ?? '',
        email:       user?.email       ?? '',
        phoneNumber: user?.phoneNumber ?? '',
    });
    const [profileSuccess, setProfileSuccess] = useState('');

    // ── Password form (new + confirm only) ──
    const [passForm, setPassForm] = useState({ newPassword: '', confirmPassword: '' });
    const [passError,   setPassError]   = useState('');
    const [passSuccess, setPassSuccess] = useState('');

    // ── Password confirmation modal ──
    const [modal, setModal] = useState<ConfirmModal>({
        open: false, type: 'profile', currentPassword: '', loading: false, error: '',
    });

    // Avatar
    const initials = [user?.firstName?.[0], user?.lastName?.[0]]
        .filter(Boolean).join('').toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';
    const displayName = user?.firstName
        ? [user.lastName, user.firstName].filter(Boolean).join(' ')
        : (user?.username ?? '');

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px',
        border: '1px solid var(--c-gray-300)', borderRadius: '8px',
        fontSize: '14px', backgroundColor: 'var(--c-white)', color: 'var(--c-gray-900)',
        boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', marginBottom: '6px', fontSize: '13px',
        fontWeight: 600, color: 'var(--c-gray-600)',
    };

    // ── Handlers ──
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setProfileSuccess('');
    };
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setModal({ open: true, type: 'profile', currentPassword: '', loading: false, error: '' });
    };

    const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setPassError(''); setPassSuccess('');
    };
    const handlePassSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            setPassError(t('settings.pass_mismatch')); return;
        }
        if (passForm.newPassword.length < 8) {
            setPassError(t('settings.pass_too_short')); return;
        }
        setModal({ open: true, type: 'password', currentPassword: '', loading: false, error: '' });
    };

    const handleModalConfirm = async () => {
        if (!modal.currentPassword) {
            setModal(m => ({ ...m, error: t('settings.enter_current_password') })); return;
        }
        setModal(m => ({ ...m, loading: true, error: '' }));
        try {
            if (modal.type === 'profile') {
                const payload: Record<string, string> = { password: modal.currentPassword };
                if (profileForm.firstName)   payload.firstName   = profileForm.firstName;
                if (profileForm.lastName)    payload.lastName    = profileForm.lastName;
                if (profileForm.surName)     payload.surName     = profileForm.surName;
                if (profileForm.email)       payload.email       = profileForm.email;
                if (profileForm.phoneNumber) payload.phoneNumber = profileForm.phoneNumber;
                const response = await api.users.updateProfile(payload);
                updateUser(response.data);
                setProfileSuccess(t('settings.profile_updated'));
            } else {
                await api.auth.changePassword({
                    oldPassword: modal.currentPassword,
                    newPassword: passForm.newPassword,
                });
                setPassSuccess(t('settings.password_changed'));
                setPassForm({ newPassword: '', confirmPassword: '' });
            }
            setModal(m => ({ ...m, open: false }));
        } catch (err: unknown) {
            const e2 = err as { response?: { data?: { message?: string | string[] } } };
            const msg = e2.response?.data?.message;
            let errorText = t('settings.pass_wrong');
            if (typeof msg === 'string') {
                if (msg.includes('PASSWORDS_IS_DUPLICATE')) errorText = t('settings.pass_duplicate');
                else if (msg.includes('PASSWORD_IS_INCORRECT')) errorText = t('settings.pass_wrong');
                else errorText = msg;
            } else if (Array.isArray(msg)) {
                errorText = msg.join(', ');
            }
            setModal(m => ({ ...m, loading: false, error: errorText }));
        }
    };
    const closeModal = () => {
        if (!modal.loading) setModal(m => ({ ...m, open: false, error: '', currentPassword: '' }));
    };

    return (
        <div className={`page-container ${styles['settings-page']}`}>

            {/* ── Account header ── */}
            <div className={`card ${styles['account-header']} animate-enter`}>
                <div className={styles['account-hero']}>
                    <div className={styles['avatar']}>{initials}</div>
                    <div className={styles['account-info']}>
                        <div className={styles['account-username']}>{displayName || user?.username}</div>
                        {user?.email && <div className={styles['account-email']}>{user.email}</div>}
                    </div>
                </div>
                <button className={`btn-outline ${styles['signout-btn']}`} onClick={logout}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                    {t('settings.sign_out')}
                </button>
            </div>

            {/* ── Tabs ── */}
            <div className={`${styles['tabs-bar']} animate-enter-d1`}>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'profile' ? styles['tab-active'] : ''}`}
                    onClick={() => setActiveTab('profile')}
                >{t('settings.tab_profile')}</button>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'activity' ? styles['tab-active'] : ''}`}
                    onClick={() => setActiveTab('activity')}
                >{t('settings.tab_activity')}</button>
            </div>

            {/* ── Profile tab ── */}
            {activeTab === 'profile' && (
                <div className="animate-enter-d2">
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Profile data */}
                        <div className={styles['settings-section']}>
                            <h2 className={styles['settings-subtitle']}>{t('settings.profile_data')}</h2>
                            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={labelStyle}>{t('settings.last_name')}</label>
                                        <input name="lastName" type="text" value={profileForm.lastName} onChange={handleProfileChange} placeholder="Иванов" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t('settings.first_name')}</label>
                                        <input name="firstName" type="text" value={profileForm.firstName} onChange={handleProfileChange} placeholder="Иван" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>{t('settings.middle_name')}</label>
                                        <input name="surName" type="text" value={profileForm.surName} onChange={handleProfileChange} placeholder="Иванович" style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} placeholder="ivan@example.com" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>{t('settings.phone_number')}</label>
                                    <input name="phoneNumber" type="tel" value={profileForm.phoneNumber} onChange={handleProfileChange} placeholder="+375291234567" style={inputStyle} />
                                </div>
                                {profileSuccess && <p style={{ color: '#10B981', fontSize: '14px', margin: 0 }}>{profileSuccess}</p>}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-primary">{t('settings.save_profile')}</button>
                                </div>
                            </form>
                        </div>

                        {/* Password change */}
                        <div className={styles['settings-section']}>
                            <h2 className={styles['settings-subtitle']}>{t('settings.change_password')}</h2>
                            <form onSubmit={handlePassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                                <div>
                                    <label style={labelStyle}>{t('settings.new_password')}</label>
                                    <input name="newPassword" type="password" value={passForm.newPassword} onChange={handlePassChange} placeholder={t('settings.new_password_placeholder')} required minLength={8} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>{t('settings.confirm_password')}</label>
                                    <input name="confirmPassword" type="password" value={passForm.confirmPassword} onChange={handlePassChange} placeholder="••••••••" required style={inputStyle} />
                                </div>
                                {passError   && <p style={{ color: 'var(--c-bright-red)', fontSize: '14px', margin: 0 }}>{passError}</p>}
                                {passSuccess && <p style={{ color: '#10B981', fontSize: '14px', margin: 0 }}>{passSuccess}</p>}
                                <p style={{ fontSize: '13px', color: 'var(--c-gray-500)', margin: 0 }}>
                                    {t('settings.password_session_warning')}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-primary">{t('settings.change_password_btn')}</button>
                                </div>
                            </form>
                        </div>

                        {/* Language */}
                        <div className={styles['settings-section']}>
                            <h2 className={styles['settings-subtitle']}>{t('settings.interface_lang')}</h2>
                            <div className={styles['language-toggle']}>
                                <button className={`${styles['lang-btn']} ${language === 'ru' ? styles['active'] : ''}`} onClick={() => setLanguage('ru')}>{t('settings.lang_ru')}</button>
                                <button className={`${styles['lang-btn']} ${language === 'en' ? styles['active'] : ''}`} onClick={() => setLanguage('en')}>{t('settings.lang_en')}</button>
                            </div>
                        </div>

                        {/* Theme */}
                        <div className={styles['settings-section']}>
                            <h2 className={styles['settings-subtitle']}>{t('settings.theme')}</h2>
                            <div className={styles['language-toggle']}>
                                <button className={`${styles['lang-btn']} ${theme === 'light' ? styles['active'] : ''}`} onClick={() => setTheme('light')}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>light_mode</span> {t('settings.theme_light')}
                                </button>
                                <button className={`${styles['lang-btn']} ${theme === 'dark' ? styles['active'] : ''}`} onClick={() => setTheme('dark')}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dark_mode</span> {t('settings.theme_dark')}
                                </button>
                                <button className={`${styles['lang-btn']} ${theme === 'system' ? styles['active'] : ''}`} onClick={() => setTheme('system')}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>desktop_windows</span> {t('settings.theme_system')}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ── Activity tab ── */}
            {activeTab === 'activity' && (
                <div className="animate-enter-d2">
                    <div className="card">
                        <div style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--c-gray-400)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '52px', display: 'block', marginBottom: '16px', opacity: 0.5 }}>history</span>
                            <p style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>{t('settings.activity_empty')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirm modal (portal → document.body, чтобы position:fixed не ломался CSS transform) ── */}
            {modal.open && createPortal(
                <div className={styles['modal-overlay']} onClick={closeModal}>
                    <div className={styles['modal-card']} onClick={e => e.stopPropagation()}>
                        <h3 className={styles['modal-title']}>
                            {modal.type === 'profile' ? t('settings.confirm_profile_title') : t('settings.confirm_password_title')}
                        </h3>
                        <p className={styles['modal-desc']}>
                            {modal.type === 'profile'
                                ? t('settings.confirm_profile_desc')
                                : t('settings.confirm_pass_desc')}
                        </p>
                        <input
                            type="password"
                            autoFocus
                            placeholder={t('settings.current_password_placeholder')}
                            value={modal.currentPassword}
                            onChange={e => setModal(m => ({ ...m, currentPassword: e.target.value, error: '' }))}
                            onKeyDown={e => { if (e.key === 'Enter' && !modal.loading) handleModalConfirm(); }}
                            style={{
                                width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                                border: `1px solid ${modal.error ? 'var(--c-bright-red)' : 'var(--c-gray-300)'}`,
                                borderRadius: '8px', fontSize: '14px',
                                backgroundColor: 'var(--c-white)', color: 'var(--c-gray-900)',
                            }}
                        />
                        {modal.error && (
                            <p style={{ color: 'var(--c-bright-red)', fontSize: '13px', margin: '8px 0 0' }}>{modal.error}</p>
                        )}
                        <div className={styles['modal-actions']}>
                            <button className="btn-outline" onClick={closeModal} disabled={modal.loading}>{t('common.cancel')}</button>
                            <button className="btn-primary" onClick={handleModalConfirm} disabled={modal.loading}>
                                {modal.loading ? t('common.saving') : t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            , document.body)}

        </div>
    );
};
