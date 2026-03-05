import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getRoleFromToken } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import styles from '../../layouts/AuthLayout.module.css';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useSettings();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.auth.login({ username, password });
            
            // Backend: access_token in response header, user object in body
            const token = response.headers['access_token'] || response.data?.access_token;
            // Extract role from JWT payload or response body
            const role = getRoleFromToken(token) ?? response.data?.role ?? 'user';
            // Body is the User object directly
            const user = {
                id:          response.data?.id,
                username:    response.data?.username    ?? username,
                email:       response.data?.email,
                firstName:   response.data?.firstName,
                lastName:    response.data?.lastName,
                surName:     response.data?.surName,
                phoneNumber: response.data?.phoneNumber,
                role,
                corporationId: response.data?.corporationId,
            };
            if (!token) {
                throw new Error(t('auth.error_token'));
            }
            
            login(token, user);
            // Redirect based on role
            if (role === 'admin') navigate('/admin');
            else if (role === 'admin-corporate') navigate('/corporate-admin');
            else navigate('/servers');
        } catch (err: unknown) {
            const errorData = err as { response?: { data?: { message?: string } } };
            setError(errorData.response?.data?.message || t('auth.error_credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={styles['auth-form-container']} onSubmit={handleSubmit}>
            <h2 className={styles['auth-form-title']}>{t('auth.login_title')}</h2>

            {error && <div style={{ color: 'var(--c-bright-red)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <div className={styles['auth-input-wrapper']}>
                <input
                    type="text"
                    className={styles['auth-input']}
                    placeholder={t('auth.username_placeholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <div className={styles['auth-input-wrapper']}>
                <input
                    type="password"
                    className={styles['auth-input']}
                    placeholder={t('auth.password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <button type="submit" className={styles['auth-submit-btn']} disabled={loading}>
                {loading ? t('auth.sign_in_loading') : t('auth.sign_in')}
            </button>
        </form>
    );
};
