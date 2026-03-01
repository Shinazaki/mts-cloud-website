import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../layouts/AuthLayout.module.css';

export const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.auth.login({ username, password });
            
            // Backend: access_token in response header, user object in body
            const token = response.headers['access_token'] || response.data?.access_token;
            // Body is the User object directly
            const user = {
                id:          response.data?.id,
                username:    response.data?.username    ?? username,
                email:       response.data?.email,
                firstName:   response.data?.firstName,
                lastName:    response.data?.lastName,
                surName:     response.data?.surName,
                phoneNumber: response.data?.phoneNumber,
            };
            if (!token) {
                throw new Error('Токен не получен от сервера');
            }
            
            login(token, user);
            navigate('/servers');
        } catch (err: unknown) {
            const errorData = err as { response?: { data?: { message?: string } } };
            setError(errorData.response?.data?.message || 'Неверные учетные данные');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={styles['auth-form-container']} onSubmit={handleSubmit}>
            <h2 className={styles['auth-form-title']}>Вход в аккаунт</h2>

            {error && <div style={{ color: 'var(--c-bright-red)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <div className={styles['auth-input-wrapper']}>
                <input
                    type="text"
                    className={styles['auth-input']}
                    placeholder="Логин (Username)"
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
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <button type="submit" className={styles['auth-submit-btn']} disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
};
