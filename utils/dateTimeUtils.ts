import { TFunction } from 'i18next';
import { differenceInDays, formatDistanceToNow } from 'date-fns';

type Nullable<T> = T | null | undefined;

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

  // Calculate daily budget used
  // Assume 30-day billing cycle (typical for GitHub Copilot)
  const billingPeriodDays = 30;
  const daysElapsed = Math.max(1, billingPeriodDays - daysRemaining);
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
