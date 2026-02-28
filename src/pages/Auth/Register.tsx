import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        surName: '',
        phoneNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Register the user
            await api.auth.register(formData);

            // 2. Automatically log them in after successful registration
            const loginResponse = await api.auth.login({
                username: formData.username,
                password: formData.password
            });

            const token = loginResponse.data.access_token || loginResponse.data.token || loginResponse.data;
            login(token, formData);
            navigate('/servers');
        } catch (err: unknown) {
            console.error('Registration error:', err);
            const errorData = err as { response?: { data?: { message?: string | string[] } }, message?: string };
            const message = errorData.response?.data?.message;
            const finalMessage = typeof message === 'string'
                ? message
                : (Array.isArray(message) ? message.join(', ') : (errorData.message || 'Ошибка регистрации'));
            setError(finalMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="auth-form-container" onSubmit={handleSubmit}>
            <h2 className="auth-form-title">Регистрация</h2>

            {error && <div className="auth-error" style={{ color: 'var(--c-bright-red)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <div className="auth-input-wrapper">
                <input type="text" className="auth-input" name="username" placeholder="Логин" value={formData.username} onChange={handleChange} required disabled={loading} />
                <span className="material-symbols-outlined auth-input-icon">person</span>
            </div>

            <div className="auth-input-wrapper">
                <input type="password" className="auth-input" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required minLength={8} disabled={loading} />
                <span className="material-symbols-outlined auth-input-icon">lock</span>
            </div>

            <div className="auth-input-wrapper">
                <input type="email" className="auth-input" name="email" placeholder="Электронная почта" value={formData.email} onChange={handleChange} required disabled={loading} />
                <span className="material-symbols-outlined auth-input-icon">mail</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="auth-input-wrapper">
                    <input type="text" className="auth-input" name="lastName" placeholder="Фамилия" value={formData.lastName} onChange={handleChange} required disabled={loading} />
                </div>
                <div className="auth-input-wrapper">
                    <input type="text" className="auth-input" name="firstName" placeholder="Имя" value={formData.firstName} onChange={handleChange} required disabled={loading} />
                </div>
            </div>

            <div className="auth-input-wrapper">
                <input type="tel" className="auth-input" name="phoneNumber" placeholder="Номер телефона" value={formData.phoneNumber} onChange={handleChange} required disabled={loading} />
                <span className="material-symbols-outlined auth-input-icon">phone</span>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
        </form>
    );
};
