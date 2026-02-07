import { fetchCopilotQuota, fetchGitHubUser, type GitHubUser } from '@/services/api';
import { getStoredToken } from '@/stores/secureStorage';
import type { AllQuotas } from '@/types/quota';
import { useQuery } from '@tanstack/react-query';

export const QUERY_KEYS = {
  GITHUB_USER: ['github', 'user'],
  COPILOT_QUOTA: ['github', 'copilot', 'quota'],
} as const;

export function useGitHubUser() {
  return useQuery<GitHubUser>({
    queryKey: QUERY_KEYS.GITHUB_USER,
    queryFn: async () => {
      const token = await getStoredToken();
      if (!token) throw new Error('Not authenticated');
      return fetchGitHubUser(token);
    },
    staleTime: Infinity,
    refetchOnMount: 'always',
  });
}

export function useCopilotQuota() {
  const query = useQuery<AllQuotas>({
    queryKey: QUERY_KEYS.COPILOT_QUOTA,
    queryFn: async () => {
      const token = await getStoredToken();
      if (!token) throw new Error('Not authenticated');

      return fetchCopilotQuota(token);
    },
    staleTime: Infinity,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });

  return {
    ...query,
    isCached: query.isFetching && !!query.data,
  };
}
