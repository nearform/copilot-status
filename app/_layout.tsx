import '@/services/i18n';
import { persistOptions, queryClient } from '@/services/queryClient';
import { ThemePreference } from '@/services/storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { goBackOrHome } from '@/utils/navigation';
import { Stack, useRootNavigationState, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useAuthStore } from '@/stores/auth';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

/**
 * Signing in is optional: signed-out users browse sample data. The only
 * redirect is leaving the connect screen once sign-in succeeds.
 */
function useAuthRedirect() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, hasCheckedAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!navigationState?.key || !hasCheckedAuth) return;

    if (isAuthenticated && segments[0] === '(auth)') {
      goBackOrHome();
    }
  }, [isAuthenticated, segments, hasCheckedAuth, navigationState?.key]);

  return { hasCheckedAuth };
}

const statusBarColor: Record<ThemePreference, 'light' | 'dark' | 'auto'> = {
  light: 'dark',
  dark: 'light',
  system: 'auto',
};

export default function RootLayout() {
  const { hasCheckedAuth } = useAuthRedirect();
  const { rt } = useUnistyles();

  // Gate only the startup token check. Gating on isLoading would unmount the
  // navigator during sign-in and drop the user off the connect screen on error.
  if (!hasCheckedAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const statusBarStyle = statusBarColor[rt.themeName ?? 'system'];

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style={statusBarStyle} />
    </PersistQueryClientProvider>
  );
}

const styles = StyleSheet.create(theme => ({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
}));
