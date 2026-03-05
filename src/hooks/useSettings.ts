import { useSettingsStore } from '../store/settingsStore';
import ruDict from '../i18n/ru.json';
import enDict from '../i18n/en.json';

type Dict = typeof ruDict;

/** Resolve a dotted key path against a nested dict object. */
function resolve(dict: Dict, key: string): string {
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = dict;
    for (const part of parts) {
        if (node == null || typeof node !== 'object') return key;
        node = node[part];
    }
    return typeof node === 'string' ? node : key;
}

export const useSettings = () => {
    const language = useSettingsStore((state) => state.language);
    const setLanguage = useSettingsStore((state) => state.setLanguage);
    const theme = useSettingsStore((state) => state.theme);
    const setTheme = useSettingsStore((state) => state.setTheme);

    const dict: Dict = language === 'ru' ? ruDict : enDict;
    const t = (key: string): string => resolve(dict, key);

    return { language, setLanguage, theme, setTheme, t };
};
