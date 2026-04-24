import { fetchCopilotQuota, fetchGitHubUser } from '@/services/api';
import type { GitHubCopilotResponse } from '@/types/api';
import type { PaidQuotas } from '@/types/quota';
import { Octokit } from '@octokit/rest';

jest.mock('@/services/storage');

describe('services/api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchGitHubUser', () => {
    it('should fetch authenticated user data', async () => {
      const mockUserData = {
        login: 'testuser',
        id: 123,
        avatar_url: 'https://example.com/avatar.png',
      };

      const mockGetAuthenticated = jest.fn().mockResolvedValue({ data: mockUserData });
      const MockedOctokit = jest.mocked(Octokit);
      MockedOctokit.mockImplementation(
        () =>
          ({
            users: {
              getAuthenticated: mockGetAuthenticated,
            },
          }) as unknown as InstanceType<typeof Octokit>
      );

      const result = await fetchGitHubUser('test-token');

      expect(Octokit).toHaveBeenCalledWith({ auth: 'test-token' });
      expect(mockGetAuthenticated).toHaveBeenCalled();
      expect(result).toEqual(mockUserData);
    });

    it('should throw error if API call fails', async () => {
      const mockError = new Error('API Error');
      const mockGetAuthenticated = jest.fn().mockRejectedValue(mockError);

      const MockedOctokit = jest.mocked(Octokit);
      MockedOctokit.mockImplementation(
        () =>
          ({
            users: {
              getAuthenticated: mockGetAuthenticated,
            },
          }) as unknown as InstanceType<typeof Octokit>
      );

      await expect(fetchGitHubUser('test-token')).rejects.toThrow('API Error');
    });
  });

  describe('fetchCopilotQuota', () => {
    const createMockQuotaSnapshot = <T extends string>(
      quotaId: T,
      entitlement: number,
      remaining: number,
      percentRemaining: number,
      unlimited: boolean = false
    ) => ({
      entitlement,
      remaining,
      percent_remaining: percentRemaining,
      overage_count: 0,
      overage_permitted: false,
      quota_id: quotaId,
      quota_remaining: remaining,
      timestamp_utc: '2024-02-01T00:00:00Z',
      unlimited,
    });

    const mockCopilotResponse: GitHubCopilotResponse = {
      access_type_sku: 'plus_yearly_subscriber_quota',
      analytics_tracking_id: 'test-tracking-id',
      assigned_date: '2024-01-01T00:00:00Z',
      can_signup_for_limited: false,
      chat_enabled: true,
      codex_agent_enabled: true,
      copilot_plan: 'individual_pro',
      endpoints: {
        api: 'https://api.individual.githubcopilot.com',
        'origin-tracker': 'https://origin-tracker.individual.githubcopilot.com',
        proxy: 'https://proxy.individual.githubcopilot.com',
        telemetry: 'https://telemetry.individual.githubcopilot.com',
      },
      organization_list: [],
      organization_login_list: [],
      quota_reset_date: '2024-02-01',
      quota_reset_date_utc: '2024-02-01T00:00:00Z',
      quota_snapshots: {
        premium_interactions: createMockQuotaSnapshot('premium_interactions', 1000, 500, 50),
        chat: createMockQuotaSnapshot('chat', 0, 0, 100, true),
        completions: createMockQuotaSnapshot('completions', 0, 0, 100, true),
      },
    };

    it('should fetch and parse copilot quota data', async () => {
      const lastUpdated = new Date('2024-01-15T12:00:00');
      jest.useFakeTimers().setSystemTime(lastUpdated);
      const mockRequest = jest.fn().mockResolvedValue({ data: mockCopilotResponse });

      const MockedOctokit = jest.mocked(Octokit);
      MockedOctokit.mockImplementation(
        () =>
          ({
            request: mockRequest,
          }) as unknown as InstanceType<typeof Octokit>
      );

      const result = await fetchCopilotQuota('test-token');

      jest.useRealTimers();

      expect(Octokit).toHaveBeenCalledWith({ auth: 'test-token' });
      expect(mockRequest).toHaveBeenCalledWith('GET /copilot_internal/user');
      expect(result.hasSubscription).toBe(true);

      const withQuotas = result as PaidQuotas;

      expect(withQuotas.premium_interactions).toEqual({
        type: 'premium_interactions',
        totalQuota: 1000,
        remainingQuota: 500,
        consumedPercent: 50,
        usedQuota: 500,
        remainingPercent: 50,
        resetDate: new Date('2024-02-01T00:00:00Z'),
        lastUpdated,
        unlimited: false,
      });

      expect(withQuotas.chat).toEqual({
        type: 'chat',
        totalQuota: 0,
        remainingQuota: 0,
        usedQuota: 0,
        remainingPercent: 100,
        consumedPercent: 0,
        lastUpdated,
        resetDate: new Date('2024-02-01T00:00:00Z'),
        unlimited: true,
      });

      expect(withQuotas.completions).toEqual({
        type: 'completions',
        totalQuota: 0,
        remainingQuota: 0,
        usedQuota: 0,
        consumedPercent: 0,
        remainingPercent: 100,
        resetDate: new Date('2024-02-01T00:00:00Z'),
        lastUpdated,
        unlimited: true,
      });
    });

    it('should calculate used quota correctly', async () => {
      const mockResponse: GitHubCopilotResponse = {
        ...mockCopilotResponse,
        quota_snapshots: {
          premium_interactions: createMockQuotaSnapshot('premium_interactions', 2000, 500, 25),
          chat: createMockQuotaSnapshot('chat', 0, 0, 100, true),
          completions: createMockQuotaSnapshot('completions', 0, 0, 100, true),
        },
      };

      const mockRequest = jest.fn().mockResolvedValue({ data: mockResponse });

      const MockedOctokit = jest.mocked(Octokit);
      MockedOctokit.mockImplementation(
        () =>
          ({
            request: mockRequest,
          }) as unknown as InstanceType<typeof Octokit>
      );

      const result = await fetchCopilotQuota('test-token');

      expect(result.hasSubscription).toBe(true);

      const withQuotas = result as PaidQuotas;

      expect(withQuotas.premium_interactions.usedQuota).toBe(1500);
      expect(withQuotas.premium_interactions.totalQuota).toBe(2000);
      expect(withQuotas.premium_interactions.remainingQuota).toBe(500);
      expect(withQuotas.premium_interactions.remainingPercent).toBe(25);
    });

    it('should clamp percent values when usage exceeds quota', async () => {
      const mockResponse: GitHubCopilotResponse = {
        ...mockCopilotResponse,
        quota_snapshots: {
          premium_interactions: createMockQuotaSnapshot('premium_interactions', 1000, -500, -50),
          chat: createMockQuotaSnapshot('chat', 500, -100, -20),
          completions: createMockQuotaSnapshot('completions', 300, -50, -16.67),
        },
      };

      const mockRequest = jest.fn().mockResolvedValue({ data: mockResponse });

      const MockedOctokit = jest.mocked(Octokit);
      MockedOctokit.mockImplementation(
        () =>
          ({
            request: mockRequest,
          }) as unknown as InstanceType<typeof Octokit>
      );

      const result = await fetchCopilotQuota('test-token');
      const withQuotas = result as PaidQuotas;

      expect(withQuotas.premium_interactions.remainingPercent).toBe(0);
      expect(withQuotas.premium_interactions.consumedPercent).toBe(100);

      expect(withQuotas.chat.remainingPercent).toBe(0);
      expect(withQuotas.chat.consumedPercent).toBe(100);

      expect(withQuotas.completions.remainingPercent).toBe(0);
      expect(withQuotas.completions.consumedPercent).toBe(100);
    });

    it('should throw error if API call fails', async () => {
      const mockError = new Error('API Error');
      const mockRequest = jest.fn().mockRejectedValue(mockError);

      const MockedOctokit = jest.mocked(Octokit);
      MockedOctokit.mockImplementation(
        () =>
          ({
            request: mockRequest,
          }) as unknown as InstanceType<typeof Octokit>
      );

      await expect(fetchCopilotQuota('test-token')).rejects.toThrow('API Error');
    });
  });
});
