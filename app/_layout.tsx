import '@/services/i18n';
import { persistOptions, queryClient } from '@/services/queryClient';
import { ThemePreference } from '@/services/storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useAuthStore } from '@/stores/auth';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function useProtectedRoute() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, navigationState?.key]);

  return { isLoading };
}

const statusBarColor: Record<ThemePreference, 'light' | 'dark' | 'auto'> = {
  light: 'dark',
  dark: 'light',
  system: 'auto',
};

export default function RootLayout() {
  const { isLoading } = useProtectedRoute();
  const { rt } = useUnistyles();

  if (isLoading) {
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
