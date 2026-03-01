import { useSettingsStore } from '../store/settingsStore';
import { ru } from '../i18n/ru';
import { en } from '../i18n/en';

export const useSettings = () => {
    const language = useSettingsStore((state) => state.language);
    const setLanguage = useSettingsStore((state) => state.setLanguage);
    const theme = useSettingsStore((state) => state.theme);
    const setTheme = useSettingsStore((state) => state.setTheme);

    const dict = language === 'ru' ? ru : en;
    const t = (key: keyof typeof ru) => dict[key] || key;

    return { language, setLanguage, theme, setTheme, t };
};
