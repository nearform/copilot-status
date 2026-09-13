import type { GitHubUser } from '@/services/api';
import type { AllQuotas, PaidQuotas } from '@/types/quota';

export const DEMO_USERNAME = 'demo-user';

export const DEMO_TOKEN = '__demo_token__';

export const DEMO_USER: GitHubUser = {
  login: 'demo-user',
  id: 0,
  node_id: '',
  avatar_url: 'https://avatars.githubusercontent.com/u/0?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/demo-user',
  html_url: 'https://github.com/demo-user',
  followers_url: '',
  following_url: '',
  gists_url: '',
  starred_url: '',
  subscriptions_url: '',
  organizations_url: '',
  repos_url: '',
  events_url: '',
  received_events_url: '',
  type: 'User',
  site_admin: false,
  name: 'Demo User',
  company: null,
  blog: '',
  location: null,
  email: 'demo@example.com',
  hireable: null,
  bio: null,
  twitter_username: null,
  notification_email: null,
  public_repos: 0,
  public_gists: 0,
  followers: 0,
  following: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const resetDate = new Date();
resetDate.setDate(resetDate.getDate() + 14);

export const DEMO_QUOTA: AllQuotas = {
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
