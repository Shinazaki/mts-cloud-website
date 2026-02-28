import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ru } from '../i18n/ru';
import { en } from '../i18n/en';

type Language = 'ru' | 'en';
type ThemeType = 'light' | 'dark' | 'system';

interface SettingsContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    t: (key: keyof typeof ru) => string;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    // Lazy initial state from localStorage
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('appLanguage');
        return (saved as Language) || 'ru';
    });

    const [theme, setThemeState] = useState<ThemeType>(() => {
        const saved = localStorage.getItem('appTheme');
        return (saved as ThemeType) || 'light';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('appLanguage', lang);
    };

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
        localStorage.setItem('appTheme', newTheme);
    };

    // Apply theme
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else if (theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) root.setAttribute('data-theme', 'dark');
            else root.removeAttribute('data-theme');
        } else {
            root.removeAttribute('data-theme');
        }
    }, [theme]);

    // Listen for system theme changes if set to 'system'
    useEffect(() => {
        if (theme !== 'system') return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            const root = document.documentElement;
            if (e.matches) root.setAttribute('data-theme', 'dark');
            else root.removeAttribute('data-theme');
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    const dict = language === 'ru' ? ru : en;
    const t = (key: keyof typeof ru) => dict[key] || key;

    return (
        <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
            {children}
        </SettingsContext.Provider>
    );
};
