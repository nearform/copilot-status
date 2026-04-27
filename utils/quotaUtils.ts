import type { AllQuotas, PaidQuotas } from '@/types/quota';

export function hasPremiumQuota(quotas: AllQuotas | undefined): quotas is PaidQuotas {
  return Boolean(quotas?.hasSubscription && 'premium_interactions' in quotas);
}
