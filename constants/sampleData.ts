import type { AllQuotas, PaidQuotas } from '@/types/quota';

/**
 * Token written to secure storage by the old hidden demo mode (5 taps on the
 * login footer). Devices that used it must be treated as signed out, otherwise
 * the app would send this placeholder to GitHub as a real token.
 */
export const LEGACY_DEMO_TOKEN = '__demo_token__';

const resetDate = new Date();
resetDate.setDate(resetDate.getDate() + 14);

/** Quota shown to signed-out users so the app is usable before connecting GitHub. */
export const SAMPLE_QUOTA: AllQuotas = {
  hasSubscription: true,
  premium_interactions: {
    type: 'premium_interactions',
    totalQuota: 1000,
    remainingQuota: 720,
    usedQuota: 280,
    remainingPercent: 72,
    consumedPercent: 28,
    resetDate,
    unlimited: false,
    lastUpdated: new Date(),
  },
  chat: {
    type: 'chat',
    totalQuota: 150,
    remainingQuota: 108,
    usedQuota: 42,
    remainingPercent: 72,
    consumedPercent: 28,
    resetDate,
    unlimited: false,
    lastUpdated: new Date(),
  },
  completions: {
    type: 'completions',
    totalQuota: 2000,
    remainingQuota: 1820,
    usedQuota: 180,
    remainingPercent: 91,
    consumedPercent: 9,
    resetDate,
    unlimited: true,
    lastUpdated: new Date(),
  },
} satisfies PaidQuotas;
