import { SAMPLE_QUOTA } from '@/constants/sampleData';
import { QUERY_KEYS, useQuota, useUser } from '@/hooks/useUserData';
import { fetchCopilotQuota, fetchGitHubUser } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { getStoredToken } from '@/stores/secureStorage';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/stores/auth', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('@/stores/secureStorage', () => ({
  getStoredToken: jest.fn(),
}));

jest.mock('@/services/api', () => ({
  fetchGitHubUser: jest.fn(),
  fetchCopilotQuota: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;
const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

function setAuthenticated(isAuthenticated: boolean) {
  mockedUseAuthStore.mockImplementation(selector => selector({ isAuthenticated }));
}

function lastQueryOptions() {
  return mockedUseQuery.mock.calls.at(-1)[0];
}

describe('hooks/useUserData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseQuery.mockReturnValue({ data: undefined, isFetching: false });
  });

  describe('useUser', () => {
    it('uses the user query key', () => {
      setAuthenticated(true);
      useUser();

      expect(lastQueryOptions().queryKey).toEqual(['user']);
    });

    it('is enabled when signed in', () => {
      setAuthenticated(true);
      useUser();

      expect(lastQueryOptions().enabled).toBe(true);
    });

    it('is disabled when signed out', () => {
      setAuthenticated(false);
      useUser();

      expect(lastQueryOptions().enabled).toBe(false);
    });

    it('fetches the GitHub user with the stored token', async () => {
      setAuthenticated(true);
      (getStoredToken as jest.Mock).mockResolvedValue('real-token');
      (fetchGitHubUser as jest.Mock).mockResolvedValue({ login: 'octocat' });
      useUser();

      await expect(lastQueryOptions().queryFn()).resolves.toEqual({ login: 'octocat' });
      expect(fetchGitHubUser).toHaveBeenCalledWith('real-token');
    });
  });

  describe('useQuota', () => {
    describe('when signed in', () => {
      beforeEach(() => setAuthenticated(true));

      it('uses the real quota key and is not sample data', () => {
        const result = useQuota();

        expect(lastQueryOptions().queryKey).toEqual(['quota']);
        expect(result.isSample).toBe(false);
      });

      it('fetches the quota with the stored token', async () => {
        (getStoredToken as jest.Mock).mockResolvedValue('real-token');
        (fetchCopilotQuota as jest.Mock).mockResolvedValue({ hasSubscription: false });
        useQuota();

        await expect(lastQueryOptions().queryFn()).resolves.toEqual({ hasSubscription: false });
        expect(fetchCopilotQuota).toHaveBeenCalledWith('real-token');
      });

      it('throws if the token is missing', async () => {
        (getStoredToken as jest.Mock).mockResolvedValue(null);
        useQuota();

        await expect(lastQueryOptions().queryFn()).rejects.toThrow('Not authenticated');
        expect(fetchCopilotQuota).not.toHaveBeenCalled();
      });
    });

    describe('when signed out', () => {
      beforeEach(() => setAuthenticated(false));

      it('uses the sample quota key and flags sample data', () => {
        const result = useQuota();

        expect(lastQueryOptions().queryKey).toEqual(['quota', 'sample']);
        expect(result.isSample).toBe(true);
      });

      it('returns sample data without calling GitHub', async () => {
        useQuota();

        await expect(lastQueryOptions().queryFn()).resolves.toBe(SAMPLE_QUOTA);
        expect(getStoredToken).not.toHaveBeenCalled();
        expect(fetchCopilotQuota).not.toHaveBeenCalled();
      });
    });

    it('keeps sample data under a different key from the widget quota key', () => {
      expect(QUERY_KEYS.SAMPLE_QUOTA).not.toEqual(QUERY_KEYS.QUOTA);
    });
  });
});
