import { formatTime, formatFullDate, getDailyQuotaInsight } from '@/utils/dateTimeUtils';
import type { TFunction } from 'i18next';

describe('dateTimeUtils', () => {
  describe('formatTime', () => {
    const createMockT = (): TFunction => {
      return jest.fn((key: string) => {
        const translations: Record<string, string> = {
          'time.never': 'Never',
        };

        return translations[key] || key;
      }) as unknown as TFunction;
    };

    let mockT: TFunction;

    beforeEach(() => {
      mockT = createMockT();
    });

    it('should return "Never" for null timestamp', () => {
      const result = formatTime(mockT, null);
      expect(result).toBe('Never');
      expect(mockT).toHaveBeenCalledWith('time.never');
    });

    it('should return "less than a minute ago" for timestamps less than 1 minute ago', () => {
      const now = Date.now();
      const timestamp = now - 10000;

      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = formatTime(mockT, new Date(timestamp));
      expect(result).toBe('less than a minute ago');

      jest.restoreAllMocks();
    });

    it('should return minutes ago for timestamps less than 60 minutes', () => {
      const now = Date.now();
      const timestamp = now - 5 * 60000;

      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = formatTime(mockT, new Date(timestamp));
      expect(result).toBe('5 minutes ago');

      jest.restoreAllMocks();
    });

    it('should return 1 minute ago for singular', () => {
      const now = Date.now();
      const timestamp = now - 1 * 60000;

      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = formatTime(mockT, new Date(timestamp));
      expect(result).toBe('1 minute ago');

      jest.restoreAllMocks();
    });

    it('should return hours ago for timestamps less than 24 hours', () => {
      const now = Date.now();
      const timestamp = now - 5 * 3600000;

      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = formatTime(mockT, new Date(timestamp));
      expect(result).toBe('about 5 hours ago');

      jest.restoreAllMocks();
    });

    it('should return formatted distance for timestamps more than 24 hours ago', () => {
      const now = Date.now();
      const timestamp = now - 25 * 3600000;

      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = formatTime(mockT, new Date(timestamp));
      expect(result).toBe('1 day ago');

      jest.restoreAllMocks();
    });
  });

  describe('formatFullDate', () => {
    const createMockT = (): TFunction => {
      return jest.fn((key: string) => {
        const translations: Record<string, string> = {
          'time.never': 'Never',
        };
        return translations[key] || key;
      }) as unknown as TFunction;
    };

    let mockT: TFunction;

    beforeEach(() => {
      mockT = createMockT();
    });

    it('should return "Never" for null timestamp', () => {
      const result = formatFullDate(mockT, null);
      expect(result).toBe('Never');
      expect(mockT).toHaveBeenCalledWith('time.never');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatFullDate(mockT, date);

      const expectedDate = date.toLocaleDateString();
      const expectedTime = date.toLocaleTimeString();
      expect(result).toBe(`${expectedDate} - ${expectedTime}`);
    });

    it('should format timestamp number correctly', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const result = formatFullDate(mockT, timestamp);

      const date = new Date(timestamp);
      const expectedDate = date.toLocaleDateString();
      const expectedTime = date.toLocaleTimeString();
      expect(result).toBe(`${expectedDate} - ${expectedTime}`);
    });
  });

  describe('getDailyQuotaInsight', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate daily average correctly with multiple days remaining', () => {
      jest.setSystemTime(new Date('2024-01-15T12:00:00'));

      const resetDate = new Date('2024-01-31T23:59:59');
      const result = getDailyQuotaInsight(300, resetDate, 700);

      expect(result.daysRemaining).toBe(16);
      expect(result.dailyAverage).toBe(18);
      // 30 - 16 = 14 days elapsed, 700 / 14 = 50
      expect(result.dailyBudgetUsed).toBe(50);
    });

    it('should return at least 1 day remaining even on reset day', () => {
      jest.setSystemTime(new Date('2024-01-31T12:00:00'));

      const resetDate = new Date('2024-01-31T23:59:59');
      const result = getDailyQuotaInsight(100, resetDate, 900);

      expect(result.daysRemaining).toBe(1);
      expect(result.dailyAverage).toBe(100);
      // 30 - 1 = 29 days elapsed, 900 / 29 = 31
      expect(result.dailyBudgetUsed).toBe(31);
    });

    it('should return 0 daily average when no quota remaining', () => {
      jest.setSystemTime(new Date('2024-01-15T12:00:00'));

      const resetDate = new Date('2024-01-31T23:59:59');
      const result = getDailyQuotaInsight(0, resetDate, 1000);

      expect(result.dailyAverage).toBe(0);
      // 30 - 16 = 14 days elapsed, 1000 / 14 = 71
      expect(result.dailyBudgetUsed).toBe(71);
    });

    it('should calculate exact daily budget for single day remaining', () => {
      jest.setSystemTime(new Date('2024-01-30T12:00:00'));

      const resetDate = new Date('2024-01-31T23:59:59');
      const result = getDailyQuotaInsight(50, resetDate, 950);

      expect(result.daysRemaining).toBe(1);
      expect(result.dailyAverage).toBe(50);
      // 30 - 1 = 29 days elapsed, 950 / 29 = 32
      expect(result.dailyBudgetUsed).toBe(32);
    });

    it('should handle negative remaining quota by returning 0 daily average', () => {
      jest.setSystemTime(new Date('2024-01-15T12:00:00'));

      const resetDate = new Date('2024-01-31T23:59:59');
      const result = getDailyQuotaInsight(-50, resetDate, 1050);

      expect(result.dailyAverage).toBe(0);
      // 30 - 16 = 14 days elapsed, 1050 / 14 = 75
      expect(result.dailyBudgetUsed).toBe(75);
    });

    it('should calculate correctly across month boundaries', () => {
      jest.setSystemTime(new Date('2024-02-28T12:00:00'));

      const resetDate = new Date('2024-03-01T00:00:00');
      const result = getDailyQuotaInsight(100, resetDate, 900);

      expect(result.daysRemaining).toBe(1);
      expect(result.dailyAverage).toBe(100);
      // 30 - 1 = 29 days elapsed, 900 / 29 = 31
      expect(result.dailyBudgetUsed).toBe(31);
    });

    it('should handle year boundaries correctly', () => {
      jest.setSystemTime(new Date('2024-12-30T12:00:00'));

      const resetDate = new Date('2025-01-01T00:00:00');
      const result = getDailyQuotaInsight(60, resetDate, 940);

      expect(result.daysRemaining).toBe(1);
      expect(result.dailyAverage).toBe(60);
      // 30 - 1 = 29 days elapsed, 940 / 29 = 32
      expect(result.dailyBudgetUsed).toBe(32);
    });

    it('should round partial days to whole days correctly', () => {
      jest.setSystemTime(new Date('2024-01-15T23:00:00'));

      const resetDate = new Date('2024-01-16T06:00:00');
      const result = getDailyQuotaInsight(100, resetDate, 900);

      expect(result.daysRemaining).toBe(1);
      expect(result.dailyAverage).toBe(100);
      // 30 - 1 = 29 days elapsed, 900 / 29 = 31
      expect(result.dailyBudgetUsed).toBe(31);
    });
  });
});
