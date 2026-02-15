import { persistOptions, queryClient } from '@/services/queryClient';

describe('services/queryClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('queryClient', () => {
    it('should be an instance of QueryClient', () => {
      expect(queryClient).toBeDefined();
      expect(queryClient.getDefaultOptions()).toBeDefined();
    });

    it('should have correct query default options', () => {
      const options = queryClient.getDefaultOptions();

      expect(typeof options.queries?.retry).toBe('function');
      expect(options.queries?.gcTime).toBe(Infinity);
      expect(options.queries?.refetchOnWindowFocus).toBe(false);
      expect(options.queries?.refetchOnReconnect).toBe(true);
      expect(options.queries?.refetchOnMount).toBe('always');
      expect(options.queries?.staleTime).toBe(Infinity);
      expect(options.queries?.networkMode).toBe('offlineFirst');
    });

    it('should have correct mutation default options', () => {
      const options = queryClient.getDefaultOptions();

      expect(options.mutations?.retry).toBe(1);
      expect(options.mutations?.networkMode).toBe('offlineFirst');
    });

    it('should have correct retry function behavior', () => {
      const options = queryClient.getDefaultOptions();
      const retry = options.queries?.retry as (failureCount: number, error: any) => boolean;

      expect(retry).toBeDefined();
      expect(typeof retry).toBe('function');

      // Should retry when failureCount < 3 and error has status
      expect(retry(0, { status: 500 })).toBeTruthy();
      expect(retry(1, { status: 500 })).toBeTruthy();
      expect(retry(2, { status: 500 })).toBeTruthy();

      // Should not retry when failureCount >= 3
      expect(retry(3, { status: 500 })).toBeFalsy();

      // Should not retry when error has no status
      expect(retry(0, {})).toBeFalsy();
      expect(retry(0, null)).toBeFalsy();
    });

    it('should have correct retryDelay function', () => {
      const options = queryClient.getDefaultOptions();
      const retryDelay = options.queries?.retryDelay as (attemptIndex: number) => number;

      expect(retryDelay).toBeDefined();
      expect(typeof retryDelay).toBe('function');

      expect(retryDelay(0)).toBe(1000);
      expect(retryDelay(1)).toBe(2000);
      expect(retryDelay(2)).toBe(4000);
      expect(retryDelay(10)).toBe(30000);
    });
  });

  describe('persistOptions', () => {
    it('should have persister defined', () => {
      expect(persistOptions.persister).toBeDefined();
    });
  });
});
