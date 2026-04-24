export type QuotaStatus = 'good' | 'warning' | 'critical';

export type QuotaType = 'premium_interactions' | 'chat' | 'completions';

export interface QuotaInfo {
  type: QuotaType;
  totalQuota: number;
  remainingQuota: number;
  usedQuota: number;
  remainingPercent: number;
  consumedPercent: number;
  resetDate: Date;
  unlimited: boolean;
  lastUpdated: Date;
}

export interface PaidQuotas {
  hasSubscription: true;
  premium_interactions: QuotaInfo;
  chat: QuotaInfo;
  completions: QuotaInfo;
}

interface FreeQuotas {
  hasSubscription: true;
  chat: QuotaInfo;
  completions: QuotaInfo;
}

interface NoQuotas {
  hasSubscription: false;
}

export type AllQuotas = PaidQuotas | FreeQuotas | NoQuotas;
