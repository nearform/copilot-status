import { DEMO_QUOTA, DEMO_TOKEN, DEMO_USER } from '@/constants/demo';
import { fetchQuota, fetchGitHubUser, type GitHubUser } from '@/services/api';
import { getStoredToken } from '@/stores/secureStorage';
import type { AllQuotas } from '@/types/quota';
import { useQuery } from '@tanstack/react-query';

export const QUERY_KEYS = {
  USER: ['user'],
  QUOTA: ['quota'],
} as const;

export function useUser() {
  return useQuery<GitHubUser>({
    queryKey: QUERY_KEYS.USER,
    queryFn: async () => {
      const token = await getStoredToken();
      if (!token) throw new Error('Not authenticated');
      if (token === DEMO_TOKEN) return DEMO_USER;
      return fetchGitHubUser(token);
    },
  });
}

export function useQuota() {
  const query = useQuery<AllQuotas>({
    queryKey: QUERY_KEYS.QUOTA,
    queryFn: async () => {
      const token = await getStoredToken();
      if (!token) throw new Error('Not authenticated');
      if (token === DEMO_TOKEN) return DEMO_QUOTA;
      return fetchQuota(token);
    },
  });

  return query;
}
