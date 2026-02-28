import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

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
            // Based on standard NestJS JWT implementation, token is usually in access_token or token
            const token = response.data.access_token || response.data.token || response.data;
            login(token, { username });
            navigate('/servers');
        } catch (err: unknown) {
            const errorData = err as { response?: { data?: { message?: string } } };
            setError(errorData.response?.data?.message || 'Неверные учетные данные');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form-container" onSubmit={handleSubmit}>
            <h2 className="auth-form-title">Вход в аккаунт</h2>

            {error && <div className="auth-error" style={{ color: 'var(--c-bright-red)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <div className="auth-input-wrapper">
                <input
                    type="text"
                    className="auth-input"
                    placeholder="Логин (Username)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <div className="auth-input-wrapper">
                <input
                    type="password"
                    className="auth-input"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
            </button>
        </form>
    );
};
