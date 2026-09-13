import { useQuota, useUser } from '@/hooks/useUserData';
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
  fetchQuota: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

describe('hooks/useUserData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isStale: false,
      isFetching: false,
    });
  });

  describe('useUser', () => {
    it('should have correct query key', () => {
      useUser();

      const options = mockedUseQuery.mock.calls[0][0];
      expect(options.queryKey).toEqual(['user']);
    });
  });

  describe('useQuota', () => {
    it('should have correct query key', () => {
      useQuota();

      const options = mockedUseQuery.mock.calls[0][0];
      expect(options.queryKey).toEqual(['quota']);
    });
  });
});
