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
            setPassError('Новые пароли не совпадают'); return;
        }
        if (passForm.newPassword.length < 8) {
            setPassError('Пароль должен быть не менее 8 символов'); return;
        }
        setModal({ open: true, type: 'password', currentPassword: '', loading: false, error: '' });
    };

    const handleModalConfirm = async () => {
        if (!modal.currentPassword) {
            setModal(m => ({ ...m, error: 'Введите текущий пароль' })); return;
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
                setProfileSuccess('Профиль успешно обновлён');
            } else {
                await api.auth.changePassword({
                    oldPassword: modal.currentPassword,
                    newPassword: passForm.newPassword,
                });
                setPassSuccess('Пароль изменён. Все другие сессии завершены.');
                setPassForm({ newPassword: '', confirmPassword: '' });
            }
            setModal(m => ({ ...m, open: false }));
        } catch (err: unknown) {
            const e2 = err as { response?: { data?: { message?: string | string[] } } };
            const msg = e2.response?.data?.message;
            let errorText = 'Неверный пароль';
            if (typeof msg === 'string') {
                if (msg.includes('PASSWORDS_IS_DUPLICATE')) errorText = 'Новый пароль совпадает с текущим';
                else if (msg.includes('PASSWORD_IS_INCORRECT')) errorText = 'Неверный пароль';
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
                    Sign Out
                </button>
            </div>

            {/* ── Tabs ── */}
            <div className={`${styles['tabs-bar']} animate-enter-d1`}>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'profile' ? styles['tab-active'] : ''}`}
                    onClick={() => setActiveTab('profile')}
                >Profile</button>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'activity' ? styles['tab-active'] : ''}`}
                    onClick={() => setActiveTab('activity')}
                >Activity</button>
            </div>

            {/* ── Profile tab ── */}
            {activeTab === 'profile' && (
                <div className="animate-enter-d2">
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Profile data */}
                        <div className={styles['settings-section']}>
                            <h2 className={styles['settings-subtitle']}>Данные профиля</h2>
                            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={labelStyle}>Фамилия</label>
                                        <input name="lastName" type="text" value={profileForm.lastName} onChange={handleProfileChange} placeholder="Иванов" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Имя</label>
                                        <input name="firstName" type="text" value={profileForm.firstName} onChange={handleProfileChange} placeholder="Иван" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Отчество</label>
                                        <input name="surName" type="text" value={profileForm.surName} onChange={handleProfileChange} placeholder="Иванович" style={inputStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} placeholder="ivan@example.com" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Номер телефона</label>
                                    <input name="phoneNumber" type="tel" value={profileForm.phoneNumber} onChange={handleProfileChange} placeholder="+375291234567" style={inputStyle} />
                                </div>
                                {profileSuccess && <p style={{ color: '#10B981', fontSize: '14px', margin: 0 }}>{profileSuccess}</p>}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-primary">Сохранить профиль</button>
                                </div>
                            </form>
                        </div>

                        {/* Password change */}
                        <div className={styles['settings-section']}>
                            <h2 className={styles['settings-subtitle']}>Смена пароля</h2>
                            <form onSubmit={handlePassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                                <div>
                                    <label style={labelStyle}>Новый пароль</label>
                                    <input name="newPassword" type="password" value={passForm.newPassword} onChange={handlePassChange} placeholder="Минимум 8 символов" required minLength={8} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Повторите новый пароль</label>
                                    <input name="confirmPassword" type="password" value={passForm.confirmPassword} onChange={handlePassChange} placeholder="••••••••" required style={inputStyle} />
                                </div>
                                {passError   && <p style={{ color: 'var(--c-bright-red)', fontSize: '14px', margin: 0 }}>{passError}</p>}
                                {passSuccess && <p style={{ color: '#10B981', fontSize: '14px', margin: 0 }}>{passSuccess}</p>}
                                <p style={{ fontSize: '13px', color: 'var(--c-gray-500)', margin: 0 }}>
                                    После смены пароля все другие активные сессии будут завершены автоматически.
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-primary">Изменить пароль</button>
                                </div>
                            </form>
                        </div>

                        {/* Language */}
                        <div className={styles['settings-section']}>
                            <h2 className={styles['settings-subtitle']}>{t('interface_lang')}</h2>
                            <div className={styles['language-toggle']}>
                                <button className={`${styles['lang-btn']} ${language === 'ru' ? styles['active'] : ''}`} onClick={() => setLanguage('ru')}>Русский</button>
                                <button className={`${styles['lang-btn']} ${language === 'en' ? styles['active'] : ''}`} onClick={() => setLanguage('en')}>English</button>
                            </div>
                        </div>

                        {/* Theme */}
                        <div className={styles['settings-section']}>
                            <h2 className={styles['settings-subtitle']}>{t('theme')}</h2>
                            <div className={styles['language-toggle']}>
                                <button className={`${styles['lang-btn']} ${theme === 'light' ? styles['active'] : ''}`} onClick={() => setTheme('light')}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>light_mode</span> {t('theme_light')}
                                </button>
                                <button className={`${styles['lang-btn']} ${theme === 'dark' ? styles['active'] : ''}`} onClick={() => setTheme('dark')}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dark_mode</span> {t('theme_dark')}
                                </button>
                                <button className={`${styles['lang-btn']} ${theme === 'system' ? styles['active'] : ''}`} onClick={() => setTheme('system')}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>desktop_windows</span> {t('theme_system')}
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
                            <p style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>История активности пока недоступна</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Confirm modal (portal → document.body, чтобы position:fixed не ломался CSS transform) ── */}
            {modal.open && createPortal(
                <div className={styles['modal-overlay']} onClick={closeModal}>
                    <div className={styles['modal-card']} onClick={e => e.stopPropagation()}>
                        <h3 className={styles['modal-title']}>
                            {modal.type === 'profile' ? 'Подтвердите изменения' : 'Подтвердите смену пароля'}
                        </h3>
                        <p className={styles['modal-desc']}>
                            {modal.type === 'profile'
                                ? 'Введите текущий пароль для сохранения изменений профиля'
                                : 'Введите текущий пароль для подтверждения операции'}
                        </p>
                        <input
                            type="password"
                            autoFocus
                            placeholder="Текущий пароль"
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
                            <button className="btn-outline" onClick={closeModal} disabled={modal.loading}>Отмена</button>
                            <button className="btn-primary" onClick={handleModalConfirm} disabled={modal.loading}>
                                {modal.loading ? 'Сохранение...' : 'Подтвердить'}
                            </button>
                        </div>
                    </div>
                </div>
            , document.body)}

        </div>
    );
};
