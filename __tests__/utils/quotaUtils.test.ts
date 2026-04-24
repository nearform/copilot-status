import type { AllQuotas, QuotaInfo } from '@/types/quota';
import { hasPremiumQuota } from '@/utils/quotaUtils';

const mockQuotaInfo: QuotaInfo = {
  type: 'chat',
  totalQuota: 100,
  remainingQuota: 50,
  usedQuota: 50,
  remainingPercent: 50,
  consumedPercent: 50,
  resetDate: new Date(),
  unlimited: false,
  lastUpdated: new Date(),
};

describe('utils/quotaUtils', () => {
  describe('hasPremiumQuota', () => {
    it('should return true for paid tier with premium_interactions', () => {
      const quotas: AllQuotas = {
        hasSubscription: true,
        premium_interactions: { ...mockQuotaInfo, type: 'premium_interactions' },
        chat: mockQuotaInfo,
        completions: { ...mockQuotaInfo, type: 'completions' },
      };
      expect(hasPremiumQuota(quotas)).toBe(true);
    });

    it('should return false for free tier without premium_interactions', () => {
      const quotas: AllQuotas = {
        hasSubscription: true,
        chat: mockQuotaInfo,
        completions: { ...mockQuotaInfo, type: 'completions' },
      };
      expect(hasPremiumQuota(quotas)).toBe(false);
    });

    it('should return false for no subscription', () => {
      const quotas: AllQuotas = { hasSubscription: false };
      expect(hasPremiumQuota(quotas)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasPremiumQuota(undefined)).toBe(false);
    });
  });
});
