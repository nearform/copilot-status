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
  snapshot: NonNullable<GitHubCopilotResponse['quota_snapshots']>[QuotaType],
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

function parseFreeQuotaSnapshot(
  quotaType: 'chat' | 'completions',
  remaining: number,
  total: number,
  resetDate: Date
): QuotaInfo {
  const used = total - remaining;
  const percentRemaining = total > 0 ? (remaining / total) * 100 : 0;
  return {
    type: quotaType,
    totalQuota: total,
    remainingQuota: remaining,
    usedQuota: used,
    remainingPercent: Math.max(0, percentRemaining),
    consumedPercent: Math.min(100, 100 - percentRemaining),
    resetDate,
    unlimited: false,
    lastUpdated: new Date(),
  };
}

function parseQuotaResponse(response: GitHubCopilotResponse): AllQuotas {
  const hasSubscription = response.access_type_sku !== 'no_access';

  if (!hasSubscription) {
    return { hasSubscription: false };
  }

  // Paid tier: has quota_snapshots
  if (response.quota_snapshots) {
    const resetDate = new Date(response.quota_reset_date_utc!);
    return {
      hasSubscription: true,
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
    };
  }

  // Free tier: limited_user_quotas = remaining, monthly_quotas = total limits
  if (response.monthly_quotas) {
    const remaining = response.limited_user_quotas ?? response.monthly_quotas;
    const total = response.monthly_quotas;
    const resetDate = response.limited_user_reset_date
      ? new Date(response.limited_user_reset_date)
      : new Date();

    return {
      hasSubscription: true,
      chat: parseFreeQuotaSnapshot('chat', remaining.chat, total.chat, resetDate),
      completions: parseFreeQuotaSnapshot('completions', remaining.completions, total.completions, resetDate),
    };
  }

  return { hasSubscription: false };
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
