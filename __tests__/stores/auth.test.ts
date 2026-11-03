import { LEGACY_DEMO_TOKEN } from '@/constants/sampleData';
import { useAuthStore } from '@/stores/auth';
import { exchangeCodeForToken } from '@/services/auth';
import { clearAuthData, getStoredToken, storeToken } from '@/stores/secureStorage';

jest.mock('@/services/auth');
jest.mock('@/stores/secureStorage');

describe('stores/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should set isAuthenticated to true if token exists', async () => {
      (getStoredToken as jest.Mock).mockResolvedValue('test-token');

      const store = useAuthStore.getState();
      await store.checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set isAuthenticated to false if no token exists', async () => {
      (getStoredToken as jest.Mock).mockResolvedValue(null);

      const store = useAuthStore.getState();
      await store.checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should mark auth as checked once complete', async () => {
      (getStoredToken as jest.Mock).mockResolvedValue(null);
      useAuthStore.setState({ hasCheckedAuth: false });

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().hasCheckedAuth).toBe(true);
    });

    it('should clear a legacy demo token and treat the user as signed out', async () => {
      (getStoredToken as jest.Mock).mockResolvedValue(LEGACY_DEMO_TOKEN);
      (clearAuthData as jest.Mock).mockResolvedValue(undefined);

      await useAuthStore.getState().checkAuth();

      expect(clearAuthData).toHaveBeenCalled();
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.hasCheckedAuth).toBe(true);
    });

    it('should handle errors during checkAuth', async () => {
      (getStoredToken as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const store = useAuthStore.getState();
      await store.checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Storage error');
      expect(state.hasCheckedAuth).toBe(true);
    });

    it('should set isLoading to true during operation', async () => {
      let resolveFn: (value: string | null) => void;
      const promise = new Promise<string | null>(resolve => {
        resolveFn = resolve;
      });
      (getStoredToken as jest.Mock).mockReturnValue(promise);

      const store = useAuthStore.getState();
      const checkAuthPromise = store.checkAuth();

      expect(useAuthStore.getState().isLoading).toBe(true);

      resolveFn!('token');
      await checkAuthPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('signIn', () => {
    it('should sign in successfully with code', async () => {
      (exchangeCodeForToken as jest.Mock).mockResolvedValue('new-token');
      (storeToken as jest.Mock).mockResolvedValue(undefined);

      const store = useAuthStore.getState();
      await store.signIn('auth-code');

      expect(exchangeCodeForToken).toHaveBeenCalledWith('auth-code', undefined);
      expect(storeToken).toHaveBeenCalledWith('new-token');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should sign in successfully with code and verifier', async () => {
      (exchangeCodeForToken as jest.Mock).mockResolvedValue('new-token');
      (storeToken as jest.Mock).mockResolvedValue(undefined);

      const store = useAuthStore.getState();
      await store.signIn('auth-code', 'code-verifier');

      expect(exchangeCodeForToken).toHaveBeenCalledWith('auth-code', 'code-verifier');
    });

    it('should handle sign in errors', async () => {
      (exchangeCodeForToken as jest.Mock).mockRejectedValue(new Error('Invalid code'));

      const store = useAuthStore.getState();
      
      await expect(store.signIn('invalid-code')).rejects.toThrow('Invalid code');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid code');
    });

    it('should handle non-Error exceptions', async () => {
      (exchangeCodeForToken as jest.Mock).mockRejectedValue('String error');

      const store = useAuthStore.getState();
      
      await expect(store.signIn('invalid-code')).rejects.toBe('String error');

      const state = useAuthStore.getState();
      expect(state.error).toBe('Sign in failed');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      (clearAuthData as jest.Mock).mockResolvedValue(undefined);

      useAuthStore.setState({ isAuthenticated: true });

      const store = useAuthStore.getState();
      await store.signOut();

      expect(clearAuthData).toHaveBeenCalled();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle sign out errors', async () => {
      (clearAuthData as jest.Mock).mockRejectedValue(new Error('Clear error'));

      const store = useAuthStore.getState();
      await store.signOut();

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Clear error');
    });

    it('should handle non-Error exceptions during sign out', async () => {
      (clearAuthData as jest.Mock).mockRejectedValue('String error');

      const store = useAuthStore.getState();
      await store.signOut();

      const state = useAuthStore.getState();
      expect(state.error).toBe('Sign out failed');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      const store = useAuthStore.getState();
      store.clearError();

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });
});
