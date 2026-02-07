import { useQuery } from '@tanstack/react-query';
import { useGitHubUser, useCopilotQuota } from '@/hooks/useGitHub';

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
    it('should have correct query key', () => {
      useGitHubUser();

      const options = mockedUseQuery.mock.calls[0][0];
      expect(options.queryKey).toEqual(['github', 'user']);
    });
  });

  describe('useCopilotQuota', () => {
    it('should have correct query key', () => {
      useCopilotQuota();

      const options = mockedUseQuery.mock.calls[0][0];
      expect(options.queryKey).toEqual(['github', 'copilot', 'quota']);
    });

    it('should report isCached when fetching with existing data', () => {
      mockedUseQuery.mockReturnValue({
        data: { premium_interactions: {} },
        isStale: false,
        isFetching: true,
      });

      const result = useCopilotQuota();

      expect(result.isCached).toBe(true);
    });

    it('should not report isCached when not fetching', () => {
      mockedUseQuery.mockReturnValue({
        data: { premium_interactions: {} },
        isStale: false,
        isFetching: false,
      });

      const result = useCopilotQuota();

      expect(result.isCached).toBe(false);
    });

    it('should not report isCached when fetching without data', () => {
      mockedUseQuery.mockReturnValue({
        data: undefined,
        isStale: false,
        isFetching: true,
      });

      const result = useCopilotQuota();

      expect(result.isCached).toBe(false);
    });
  });
});
