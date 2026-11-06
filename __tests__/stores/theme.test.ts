import { useThemeStore } from '@/stores/theme';
import { updateAppWidget } from '@/widgets/voltraWidgetService';
import { UnistylesRuntime } from 'react-native-unistyles';

jest.mock('@/services/storage', () => ({
  StorageKeys: { THEME_PREFERENCE: 'theme_preference' },
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('@/widgets/voltraWidgetService');
jest.mock('react-native-unistyles', () => ({
  UnistylesRuntime: {
    setAdaptiveThemes: jest.fn(),
    setTheme: jest.fn(),
  },
}));

describe('stores/theme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useThemeStore.setState({
      themePreference: 'system',
    });
  });

  describe('setThemePreference', () => {
    it('should set light theme and update storage', () => {
      const store = useThemeStore.getState();
      store.setThemePreference('light');

      expect(useThemeStore.getState().themePreference).toBe('light');
      expect(UnistylesRuntime.setAdaptiveThemes).toHaveBeenCalledWith(false);
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith('light');
      expect(updateAppWidget).toHaveBeenCalled();
    });

    it('should set dark theme and update storage', () => {
      const store = useThemeStore.getState();
      store.setThemePreference('dark');

      expect(useThemeStore.getState().themePreference).toBe('dark');
      expect(UnistylesRuntime.setAdaptiveThemes).toHaveBeenCalledWith(false);
      expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith('dark');
      expect(updateAppWidget).toHaveBeenCalled();
    });

    it('should set system theme with adaptive mode', () => {
      const store = useThemeStore.getState();
      store.setThemePreference('system');

      expect(useThemeStore.getState().themePreference).toBe('system');
      expect(UnistylesRuntime.setAdaptiveThemes).toHaveBeenCalledWith(true);
      expect(UnistylesRuntime.setTheme).not.toHaveBeenCalled();
      expect(updateAppWidget).toHaveBeenCalled();
    });
  });
});
