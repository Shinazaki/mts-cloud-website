import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../layouts/AuthLayout.module.css';

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
            // Register automatically logs in and returns tokens (based on new backend architecture)
            const response = await api.auth.register(formData);

            const token = response.headers['access_token'] || response.data?.access_token;
            const user = {
                id:          response.data?.id,
                username:    response.data?.username    ?? formData.username,
                email:       response.data?.email       ?? formData.email,
                firstName:   response.data?.firstName   ?? formData.firstName,
                lastName:    response.data?.lastName    ?? formData.lastName,
                surName:     response.data?.surName     ?? formData.surName,
                phoneNumber: response.data?.phoneNumber ?? formData.phoneNumber,
            };
            if (!token) {
                throw new Error('Токен не получен от сервера');
            }
            
            login(token, user);
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
        <form className={styles['auth-form-container']} onSubmit={handleSubmit}>
            <h2 className={styles['auth-form-title']}>Регистрация</h2>

            {error && <div style={{ color: 'var(--c-bright-red)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

            <div className={styles['auth-input-wrapper']}>
                <input type="text" className={styles['auth-input']} name="username" placeholder="Логин" value={formData.username} onChange={handleChange} required disabled={loading} />
                <span className={`material-symbols-outlined ${styles['auth-input-icon']}`}>person</span>
            </div>

            <div className={styles['auth-input-wrapper']}>
                <input type="password" className={styles['auth-input']} name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required minLength={8} disabled={loading} />
                <span className={`material-symbols-outlined ${styles['auth-input-icon']}`}>lock</span>
            </div>

            <div className={styles['auth-input-wrapper']}>
                <input type="email" className={styles['auth-input']} name="email" placeholder="Электронная почта" value={formData.email} onChange={handleChange} required disabled={loading} />
                <span className={`material-symbols-outlined ${styles['auth-input-icon']}`}>mail</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className={styles['auth-input-wrapper']}>
                    <input type="text" className={styles['auth-input']} name="lastName" placeholder="Фамилия" value={formData.lastName} onChange={handleChange} required disabled={loading} />
                </div>
                <div className={styles['auth-input-wrapper']}>
                    <input type="text" className={styles['auth-input']} name="firstName" placeholder="Имя" value={formData.firstName} onChange={handleChange} required disabled={loading} />
                </div>
            </div>

            <div className={styles['auth-input-wrapper']}>
                <input type="tel" className={styles['auth-input']} name="phoneNumber" placeholder="Номер телефона" value={formData.phoneNumber} onChange={handleChange} required disabled={loading} />
                <span className={`material-symbols-outlined ${styles['auth-input-icon']}`}>phone</span>
            </div>

            <button type="submit" className={styles['auth-submit-btn']} disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
        </form>
    );
};
