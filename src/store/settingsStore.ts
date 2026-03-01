import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type Language = 'ru' | 'en';
type ThemeType = 'light' | 'dark' | 'system';

interface SettingsState {
  language: Language;
  theme: ThemeType;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeType) => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        language: 'ru',
        theme: 'light',
        setLanguage: (language) => set({ language }, false, 'settings/setLanguage'),
        setTheme: (theme) => set({ theme }, false, 'settings/setTheme'),
      }),
      {
        name: 'settings-storage',
      }
    ),
    { name: 'settings-store' }
  )
);
