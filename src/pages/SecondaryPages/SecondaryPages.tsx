import React from 'react';

export const Backups: React.FC = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Бэкапы</h1>
            </div>
            <div className="placeholder-content">
                <h3>Резервные копии</h3>
                <p>Настройте автоматическое создание резервных копий ваших серверов.</p>
            </div>
        </div>
    );
};

export const Monitoring: React.FC = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Мониторинг</h1>
            </div>
            <div className="placeholder-content">
                <h3>Графики и метрики</h3>
                <p>Метрики использования ресурсов (CPU, RAM, Disk).</p>
            </div>
        </div>
    );
};

export const Traffic: React.FC = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Трафик</h1>
            </div>
            <div className="placeholder-content">
                <h3>Использование сети</h3>
                <p>Статистика потребления сетевого трафика.</p>
            </div>
        </div>
    );
};

export const APIPage: React.FC = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">API</h1>
                <button className="btn-primary">
                    Сгенерировать токен <span className="material-symbols-outlined">key</span>
                </button>
            </div>
            <div className="placeholder-content">
                <h3>Управление ключами API</h3>
                <p>Используйте API для программного управления ресурсами.</p>
            </div>
        </div>
    );
};

export const QA: React.FC = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Q&A (Часто задаваемые вопросы)</h1>
            </div>
            <div className="content-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid var(--c-gray-300)' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>Как изменить конфигурацию сервера (Расширить)?</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }}>Вы можете перейти на вкладку <strong>Сервера</strong>, найти нужный сервер и нажать кнопку "Расширить". Вы также можете создать новый сервер с новой конфигурацией.</p>
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>Как работает биллинг?</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }}>Списание средств происходит ежемесячно в зависимости от потребленных ресурсов (Pay-as-you-go). Пополнить баланс можно в разделе <strong>Счета и оплата</strong>.</p>
                </div>
                <div>
                    <h3 style={{ color: 'var(--c-dark-blue)', marginBottom: '8px' }}>Что делать, если я забыл пароль от сервера?</h3>
                    <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.5' }}>Откройте меню "Ещё" рядом с сервером и выберите пункт "Доступ к терминалу", либо перейдите в панель управления сервером для сброса пароля root.</p>
                </div>
            </div>
        </div>
    );
};

export const WhatsNew: React.FC = () => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Что нового?</h1>
            </div>
            <div className="content-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid var(--c-gray-300)' }}>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '32px', borderBottom: '1px solid var(--c-gray-100)', paddingBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--c-red)' }}>new_releases</span>
                            <strong style={{ fontSize: '18px', color: 'var(--c-dark-blue)' }}>Обновление портала MTC Cloud - Фаза 2</strong>
                            <span style={{ fontSize: '12px', color: 'var(--c-gray-500)', marginLeft: 'auto' }}>Сегодня</span>
                        </div>
                        <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.6' }}>
                            В этом обновлении мы добавили множество новых функций:
                            <br />- Интеграция JWT авторизации для безопасного входа
                            <br />- Новая страница создания сервера с выбором региона и ОС
                            <br />- Динамическое выпадающее меню со списком ваших серверов в боковой панели
                            <br />- Интерактивный поиск серверов и новые действия (Терминал, Использование ресурсов, Уничтожение)
                            <br />- Улучшенный интерфейс приложения в стилистике MTC
                        </p>
                    </li>
                    <li>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--c-gray-500)' }}>history</span>
                            <strong style={{ fontSize: '18px', color: 'var(--c-dark-blue)' }}>Запуск Beta версии</strong>
                            <span style={{ fontSize: '12px', color: 'var(--c-gray-500)', marginLeft: 'auto' }}>Ранее</span>
                        </div>
                        <p style={{ color: 'var(--c-gray-600)', lineHeight: '1.6' }}>
                            Базовый запуск панелей управления сервером и биллингом.
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
};
