import { CircularProgress } from '@/components/CircularProgress';
import { QuotaInfo } from '@/types/quota';
import { fireEvent, render, screen } from '@testing-library/react-native';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'quota.used': 'USED',
        'quota.available': 'AVAILABLE',
        'quota.toggleToAvailable': 'Show available quota',
        'quota.toggleToUsed': 'Show used quota',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock react-native-pie-chart
jest.mock('react-native-pie-chart', () => {
  const { View } = require('react-native');
  return function MockPieChart() {
    return <View testID="mock-pie-chart" />;
  };
});

// Mock useUnistyles
jest.mock('react-native-unistyles', () => ({
  useUnistyles: () => ({
    theme: {
      colors: {
        critical: '#ff0000',
        warning: '#ff9900',
        good: '#00ff00',
        border: '#cccccc',
        text: '#000000',
        icon: '#666666',
      },
      spacing: {
        lg: 16,
      },
      typography: {
        fontWeights: {
          bold: '700',
          medium: '500',
        },
        fontSizes: {
          '5xl': 32,
        },
      },
    },
  }),
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

describe('CircularProgress', () => {
  const createQuotaInfo = (usedQuota: number, totalQuota: number): QuotaInfo => ({
    type: 'premium_interactions',
    totalQuota,
    remainingQuota: totalQuota - usedQuota,
    usedQuota,
    remainingPercent: totalQuota > 0 ? ((totalQuota - usedQuota) / totalQuota) * 100 : 0,
    consumedPercent: totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0,
    resetDate: new Date(),
    unlimited: false,
    lastUpdated: new Date(),
  });

  it('renders correctly with initial state showing used quota', () => {
    const quota = createQuotaInfo(50, 100);
    render(<CircularProgress quota={quota} size={200} />);

    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('USED')).toBeTruthy();
  });

  it('toggles to show available quota when pressed', () => {
    const quota = createQuotaInfo(50, 100);
    render(<CircularProgress quota={quota} size={200} />);

    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('USED')).toBeTruthy();

    const pressable = screen.getByRole('button');
    fireEvent.press(pressable);

    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('AVAILABLE')).toBeTruthy();
  });

  it('toggles back to used quota when pressed again', () => {
    const quota = createQuotaInfo(50, 100);
    render(<CircularProgress quota={quota} size={200} />);

    const pressable = screen.getByRole('button');

    fireEvent.press(pressable);
    expect(screen.getByText('AVAILABLE')).toBeTruthy();

    fireEvent.press(pressable);
    expect(screen.getByText('USED')).toBeTruthy();
  });

  it('calculates percentages correctly for different quota values', () => {
    const quota1 = createQuotaInfo(75, 100);
    const { rerender } = render(<CircularProgress quota={quota1} size={200} />);

    expect(screen.getByText('75%')).toBeTruthy();

    const pressable = screen.getByRole('button');
    fireEvent.press(pressable);

    expect(screen.getByText('25%')).toBeTruthy();

    const quota2 = createQuotaInfo(90, 100);
    rerender(<CircularProgress quota={quota2} size={200} />);

    expect(screen.getByText('10%')).toBeTruthy();
  });

  it('handles edge case with 0 total quota', () => {
    const quota = createQuotaInfo(0, 0);
    render(<CircularProgress quota={quota} size={200} />);

    expect(screen.getByText('0%')).toBeTruthy();
    expect(screen.getByText('USED')).toBeTruthy();
  });

  it('handles edge case with full quota usage', () => {
    const quota = createQuotaInfo(100, 100);
    render(<CircularProgress quota={quota} size={200} />);

    expect(screen.getByText('100%')).toBeTruthy();

    const pressable = screen.getByRole('button');
    fireEvent.press(pressable);

    expect(screen.getByText('0%')).toBeTruthy();
    expect(screen.getByText('AVAILABLE')).toBeTruthy();
  });
});
