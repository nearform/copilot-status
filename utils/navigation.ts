import { router } from 'expo-router';

/** Return to the previous screen, or to the dashboard if there is none. */
export function goBackOrHome(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/(tabs)');
  }
}
