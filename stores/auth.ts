import { LEGACY_DEMO_TOKEN } from '@/constants/sampleData';
import { queryClient, queryPersister } from '@/services/queryClient';
import { exchangeCodeForToken } from '@/services/auth';
import { clearAuthData, getStoredToken, storeToken } from '@/stores/secureStorage';
import { clearAppWidget } from '@/widgets/voltraWidgetService';
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once the stored token has been checked at startup. */
  hasCheckedAuth: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  signIn: (code: string, codeVerifier?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>(set => {
  return {
    isAuthenticated: false,
    isLoading: true,
    hasCheckedAuth: false,
    error: null,

    checkAuth: async () => {
      set({ isLoading: true, error: null });
      try {
        let token = await getStoredToken();
        if (token === LEGACY_DEMO_TOKEN) {
          // The old demo mode cached fake data under the real query keys.
          // Purge it before removing the token, so an interrupted migration
          // still finds the token and retries on next launch.
          queryClient.clear();
          await queryPersister.removeClient();
          await clearAppWidget();
          await clearAuthData();
          token = null;
        }
        set({
          isAuthenticated: token !== null,
          isLoading: false,
          hasCheckedAuth: true,
        });
      } catch (error) {
        set({
          isAuthenticated: false,
          isLoading: false,
          hasCheckedAuth: true,
          error: error instanceof Error ? error.message : 'Failed to check auth',
        });
      }
    },

    signIn: async (code: string, codeVerifier?: string) => {
      set({ isLoading: true, error: null });
      try {
        const token = await exchangeCodeForToken(code, codeVerifier);
        await storeToken(token);
        set({ isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Sign in failed',
        });
        throw error;
      }
    },

    signOut: async () => {
      set({ isLoading: true });
      try {
        await clearAuthData();
        set({
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Sign out failed',
        });
      }
    },

    clearError: () => set({ error: null }),
  };
});
