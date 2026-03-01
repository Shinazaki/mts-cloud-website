import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { t } = useSettings();

  const displayName = user?.firstName
    ? [user.lastName, user.firstName].filter(Boolean).join(' ')
    : (user?.username ?? t('account'));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore backend logout errors and still clear local auth state
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles['header-right']}>

        <button className={styles['btn-secondary']} onClick={() => navigate('/servers/create')}>
          <span className="material-symbols-outlined">add</span>
          {t('create')}
        </button>

        {/* ── Icon group ── */}
        <div className={styles['icon-group']}>
          <button className={styles['icon-btn']} title={t('support')} onClick={() => navigate('/support')}>
            <span className="material-symbols-outlined">help</span>
          </button>

          <div style={{ position: 'relative' }} ref={notifRef}>
            <button className={styles['icon-btn']} title={t('notifications')} onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
              <span className="material-symbols-outlined">feedback</span>
            </button>
            <AnimatePresence initial={false}>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={styles['account-dropdown-menu']}
                style={{ minWidth: '260px', padding: '16px' }}
              >
                <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: 'var(--c-dark-blue)' }}>
                  {t('notifications')}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--c-gray-500)', textAlign: 'center', padding: '12px 0' }}>
                  {t('no_notifications')}
                </p>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          <button className={styles['icon-btn']} title={t('whatsNew')} onClick={() => navigate('/whats-new')}>
            <span className="material-symbols-outlined">article</span>
          </button>
        </div>

        {/* ── Separator ── */}
        <div className={styles['header-separator']} />

        {/* ── Account block ── */}
        <div className={styles['account-dropdown-wrapper']} ref={dropdownRef}>
          <div className={styles['account-info']} onClick={() => setIsAccountOpen(!isAccountOpen)}>
            <div className={styles['account-text']}>
              <span className={styles['account-name']}>{displayName}</span>
              <span className={styles['account-balance']}>{t('balance')}: 0 BYN</span>
            </div>
          </div>
          <AnimatePresence initial={false}>
          {isAccountOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={styles['account-dropdown-menu']}
            >
              <button className={styles['dropdown-item']} onClick={() => { setIsAccountOpen(false); navigate('/settings'); }}>
                <span className="material-symbols-outlined">settings</span> {t('settings')}
              </button>
              <button className={styles['dropdown-item']} onClick={handleLogout}>
                <span className="material-symbols-outlined">logout</span> {t('logout')}
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};