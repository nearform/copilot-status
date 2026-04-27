// GitHub Copilot API response structure
export interface GitHubCopilotResponse {
  access_type_sku: string;
  analytics_tracking_id: string;
  assigned_date: string;
  can_signup_for_limited: boolean;
  chat_enabled: boolean;
  codex_agent_enabled?: boolean;
  copilot_plan: string;
  endpoints: Endpoints;
  organization_list: unknown[];
  organization_login_list: unknown[];
  quota_reset_date?: string;
  quota_reset_date_utc?: string;
  quota_snapshots?: QuotaSnapshots;
  // Free tier fields
  limited_user_quotas?: LimitedUserQuotas;
  limited_user_subscribed_day?: number;
  limited_user_reset_date?: string;
  monthly_quotas?: LimitedUserQuotas;
}

interface Endpoints {
  api: string;
  'origin-tracker': string;
  proxy: string;
  telemetry: string;
}

interface QuotaSnapshots {
  chat: Quota<'chat'>;
  completions: Quota<'completions'>;
  premium_interactions: Quota<'premium_interactions'>;
}

interface Quota<T> {
  entitlement: number;
  overage_count: number;
  overage_permitted: boolean;
  percent_remaining: number;
  quota_id: T;
  quota_remaining: number;
  remaining: number;
  timestamp_utc: string;
  unlimited: boolean;
}

interface LimitedUserQuotas {
  chat: number;
  completions: number;
}
