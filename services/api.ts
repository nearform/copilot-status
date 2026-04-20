import type { GitHubCopilotResponse } from '@/types/api';
import type { AllQuotas, QuotaInfo, QuotaType } from '@/types/quota';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';

export type GitHubUser = RestEndpointMethodTypes['users']['getAuthenticated']['response']['data'];

export async function fetchGitHubUser(token: string): Promise<GitHubUser> {
  const octokit = new Octokit({
    auth: token,
  });

  const { data } = await octokit.users.getAuthenticated();
  return data;
}

function parseQuotaSnapshot(
  quotaType: QuotaType,
  snapshot: GitHubCopilotResponse['quota_snapshots'][QuotaType],
  resetDate: Date
): QuotaInfo {
  return {
    type: quotaType,
    totalQuota: snapshot.entitlement,
    remainingQuota: snapshot.remaining,
    usedQuota: snapshot.entitlement - snapshot.remaining,
    remainingPercent: Math.max(0, snapshot.percent_remaining),
    consumedPercent: Math.min(100, 100 - snapshot.percent_remaining),
    resetDate,
    unlimited: snapshot.unlimited,
    lastUpdated: new Date(),
  };
}

function parseQuotaResponse(response: GitHubCopilotResponse): AllQuotas {
  const resetDate = new Date(response.quota_reset_date_utc);
  const hasSubscription = response.access_type_sku !== 'no_access';

  return hasSubscription
    ? {
        hasSubscription,
        premium_interactions: parseQuotaSnapshot(
          'premium_interactions',
          response.quota_snapshots.premium_interactions,
          resetDate
        ),
        chat: parseQuotaSnapshot('chat', response.quota_snapshots.chat, resetDate),
        completions: parseQuotaSnapshot(
          'completions',
          response.quota_snapshots.completions,
          resetDate
        ),
      }
    : { hasSubscription };
}

export async function fetchCopilotQuota(token: string): Promise<AllQuotas> {
  const octokit = new Octokit({
    auth: token,
  });

  const { data } = (await octokit.request('GET /copilot_internal/user')) as {
    data: GitHubCopilotResponse;
  };

  return parseQuotaResponse(data);
}
