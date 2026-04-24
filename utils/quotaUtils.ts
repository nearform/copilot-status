import type { AllQuotas } from '@/types/quota';

export function hasPremiumQuota(quotas: AllQuotas | undefined): boolean {
  return !!quotas?.hasSubscription && 'premium_interactions' in quotas;
}
