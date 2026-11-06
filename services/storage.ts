import { createMMKV, type MMKV } from 'react-native-mmkv';

export const StorageKeys = {
  THEME_PREFERENCE: 'theme_preference',
} as const;

export const storage: MMKV = createMMKV({
  id: 'codemeter-storage',
});

export type ThemePreference = 'light' | 'dark' | 'system';
