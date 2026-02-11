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

interface WithQuotas {
  hasSubscription: true;
  premium_interactions: QuotaInfo;
  chat: QuotaInfo;
  completions: QuotaInfo;
}

interface WithoutQuotas {
  hasSubscription: false;
}

export type AllQuotas = WithQuotas | WithoutQuotas;
