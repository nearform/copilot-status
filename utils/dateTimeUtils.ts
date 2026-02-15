import { TFunction } from 'i18next';
import { differenceInDays, formatDistanceToNow } from 'date-fns';

type Nullable<T> = T | null | undefined;

// GitHub Copilot typically uses a 30-day billing cycle
// This is used as a reasonable approximation when the exact billing start date is not available
const BILLING_CYCLE_DAYS = 30;

export interface DailyQuotaInsight {
  daysRemaining: number;
  dailyAverage: number;
  dailyBudgetUsed: number;
}

export function getDailyQuotaInsight(
  remainingQuota: number,
  resetDate: Date,
  usedQuota: number = 0
): DailyQuotaInsight {
  const now = new Date();

  const diffDays = differenceInDays(resetDate, now);

  const daysRemaining = Math.max(1, Math.round(diffDays));
  const dailyAverage = Math.max(0, Math.floor(remainingQuota / daysRemaining));

  // Calculate daily budget used based on days elapsed in the billing cycle
  // Note: This approximation assumes a standard billing cycle length
  const daysElapsed = Math.max(1, BILLING_CYCLE_DAYS - daysRemaining);
  const dailyBudgetUsed = Math.max(0, Math.floor(usedQuota / daysElapsed));

  return {
    daysRemaining,
    dailyAverage,
    dailyBudgetUsed,
  };
}

export const formatTime = (t: TFunction, timestamp: Nullable<Date>): string => {
  if (!timestamp) return t('time.never');

  const dateTimestamp = new Date(timestamp);

  return formatDistanceToNow(dateTimestamp, { addSuffix: true });
};

export const formatFullDate = (t: TFunction, timestamp: Nullable<Date | number>): string => {
  if (!timestamp) return t('time.never');
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
};
