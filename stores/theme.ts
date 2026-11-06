import { storage, StorageKeys, type ThemePreference } from '@/services/storage';
import { updateAppWidget } from '@/widgets/voltraWidgetService';
import { Appearance } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeState {
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
  isDarkMode: () => boolean;
}

const mmkvStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (_name: string): void => {},
};

const applyTheme = (theme: ThemePreference) => {
  if (theme === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(theme);
  }

  updateAppWidget();
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themePreference: 'system',

      setThemePreference: (themePreference: ThemePreference) => {
        set({ themePreference });
        applyTheme(themePreference);
      },
      isDarkMode: () => {
        const themePreference = get().themePreference;
        if (themePreference === 'system') {
          return Appearance.getColorScheme() === 'dark';
        }
        return themePreference === 'dark';
      },
    }),
    {
      name: StorageKeys.THEME_PREFERENCE,
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => state => {
        if (state) {
          applyTheme(state.themePreference);
        }
      },
    }
  )
);
