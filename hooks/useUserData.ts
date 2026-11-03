import { SAMPLE_QUOTA } from '@/constants/sampleData';
import { fetchCopilotQuota, fetchGitHubUser, type GitHubUser } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { getStoredToken } from '@/stores/secureStorage';
import type { AllQuotas } from '@/types/quota';
import { useQuery } from '@tanstack/react-query';

export const QUERY_KEYS = {
  USER: ['user'],
  QUOTA: ['quota'],
  // Kept apart from QUOTA so sample data never reaches the home screen widget,
  // which reads QUOTA by exact key.
  SAMPLE_QUOTA: ['quota', 'sample'],
} as const;

async function requireToken(): Promise<string> {
  const token = await getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}

export function useUser() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery<GitHubUser>({
    queryKey: QUERY_KEYS.USER,
    queryFn: async () => fetchGitHubUser(await requireToken()),
    enabled: isAuthenticated,
  });
}

/**
 * Signed-in users get their real quota. Signed-out users get sample data,
 * flagged with `isSample` so the UI can label it.
 */
export function useQuota() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const query = useQuery<AllQuotas>({
    queryKey: isAuthenticated ? QUERY_KEYS.QUOTA : QUERY_KEYS.SAMPLE_QUOTA,
    queryFn: isAuthenticated
      ? async () => fetchCopilotQuota(await requireToken())
      : async () => SAMPLE_QUOTA,
  });

  return { ...query, isSample: !isAuthenticated };
}
