import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: undefined,
    isStale: false,
    isFetching: false,
  })),
}));

jest.mock('@/stores/secureStorage', () => ({
  getStoredToken: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  fetchGitHubUser: jest.fn(),
  fetchCopilotQuota: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe('hooks/useGitHub', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isStale: false,
      isFetching: false,
    });
  });

  describe('useGitHubUser', () => {
    it('should use staleTime Infinity so data never expires', () => {
      const { useGitHubUser } = require('@/hooks/useGitHub');
      useGitHubUser();

      const options = mockedUseQuery.mock.calls[0][0];
      expect(options.staleTime).toBe(Infinity);
    });

    it('should always refetch on mount', () => {
      const { useGitHubUser } = require('@/hooks/useGitHub');
      useGitHubUser();

      const options = mockedUseQuery.mock.calls[0][0];
      expect(options.refetchOnMount).toBe('always');
    });
  });

  describe('useCopilotQuota', () => {
    it('should use staleTime Infinity so data never expires', () => {
      const { useCopilotQuota } = require('@/hooks/useGitHub');
      useCopilotQuota();

      const options = mockedUseQuery.mock.calls[0][0];
      expect(options.staleTime).toBe(Infinity);
    });

    it('should always refetch on mount', () => {
      const { useCopilotQuota } = require('@/hooks/useGitHub');
      useCopilotQuota();

      const options = mockedUseQuery.mock.calls[0][0];
      expect(options.refetchOnMount).toBe('always');
    });

    it('should report isCached when fetching with existing data', () => {
      mockedUseQuery.mockReturnValue({
        data: { premium_interactions: {} },
        isStale: false,
        isFetching: true,
      });

      const { useCopilotQuota } = require('@/hooks/useGitHub');
      const result = useCopilotQuota();

      expect(result.isCached).toBe(true);
    });

    it('should not report isCached when not fetching', () => {
      mockedUseQuery.mockReturnValue({
        data: { premium_interactions: {} },
        isStale: false,
        isFetching: false,
      });

      const { useCopilotQuota } = require('@/hooks/useGitHub');
      const result = useCopilotQuota();

      expect(result.isCached).toBe(false);
    });

    it('should not report isCached when fetching without data', () => {
      mockedUseQuery.mockReturnValue({
        data: undefined,
        isStale: false,
        isFetching: true,
      });

      const { useCopilotQuota } = require('@/hooks/useGitHub');
      const result = useCopilotQuota();

      expect(result.isCached).toBe(false);
    });
  });
});
