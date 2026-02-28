import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import './Header.css';

export const Header: React.FC = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useSettings();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setIsConfigOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-right">

        {/* ── Configuration pill button ── */}
        <div style={{ position: 'relative' }} ref={configRef}>
          <button className="btn-secondary" onClick={() => setIsConfigOpen(!isConfigOpen)}>
            {t('configuration')}
            <span className="material-symbols-outlined">expand_more</span>
          </button>

          {isConfigOpen && (
            <div className="account-dropdown-menu" style={{ minWidth: '220px' }}>
              <button className="dropdown-item" onClick={() => { setIsConfigOpen(false); navigate('/servers/create'); }}>
                <span className="material-symbols-outlined">add</span> {t('create_server')}
              </button>
              <button className="dropdown-item" onClick={() => { setIsConfigOpen(false); navigate('/servers'); }}>
                <span className="material-symbols-outlined">dns</span> {t('management')}
              </button>
            </div>
          )}
        </div>

        {/* ── Icon group ── */}
        <div className="icon-group">
          <button className="icon-btn" title={t('support')} onClick={() => navigate('/support')}>
            <span className="material-symbols-outlined">help</span>
          </button>

          <div style={{ position: 'relative' }} ref={notifRef}>
            <button className="icon-btn" title={t('notifications')} onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
              <span className="material-symbols-outlined">feedback</span>
            </button>
            {isNotificationsOpen && (
              <div className="account-dropdown-menu" style={{ minWidth: '260px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: 'var(--c-dark-blue)' }}>
                  {t('notifications')}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--c-gray-500)', textAlign: 'center', padding: '12px 0' }}>
                  {t('no_notifications')}
                </p>
              </div>
            )}
          </div>

          <button className="icon-btn" title={t('whatsNew')} onClick={() => navigate('/whats-new')}>
            <span className="material-symbols-outlined">article</span>
          </button>
        </div>

        {/* ── Separator ── */}
        <div className="header-separator" />

        {/* ── Account block ── */}
        <div className="account-dropdown-wrapper" ref={dropdownRef}>
          <div className="account-info" onClick={() => setIsAccountOpen(!isAccountOpen)}>
            <div className="account-text">
              <span className="account-name">{t('account')}</span>
              <span className="account-balance">{t('balance')}: 0 BYN</span>
            </div>
            <div className="avatar-wrapper">
              <button className="avatar-btn" tabIndex={-1}>
                <span className="material-symbols-outlined">person</span>
              </button>
              <span className="material-symbols-outlined dropdown-icon">expand_more</span>
            </div>
          </div>

          {isAccountOpen && (
            <div className="account-dropdown-menu">
              <button className="dropdown-item" onClick={() => { setIsAccountOpen(false); navigate('/settings'); }}>
                <span className="material-symbols-outlined">settings</span> {t('settings')}
              </button>
              <button className="dropdown-item" onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span> {t('logout')}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};