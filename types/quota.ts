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

interface FreeQuotas {
  hasSubscription: true;
  chat: QuotaInfo;
  completions: QuotaInfo;
}

export interface PaidQuotas extends FreeQuotas {
  premium_interactions: QuotaInfo;
}

interface NoQuotas {
  hasSubscription: false;
}

export type AllQuotas = PaidQuotas | FreeQuotas | NoQuotas;
