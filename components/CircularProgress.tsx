import { QuotaInfo } from '@/types/quota';
import { getAvailableColorByPercent, getColorByPercent } from '@/utils/colorUtils';
import { formatPercent } from '@/utils/numberUtils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import PieChart from 'react-native-pie-chart';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CircularProgressProps {
  quota: QuotaInfo;
  size?: number;
}

const PIE_CHART_COVER = { radius: 0.7, color: 'transparent' };

export function CircularProgress({ quota, size = 360 }: CircularProgressProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [showAvailable, setShowAvailable] = useState(false);

  const { consumedPercent, remainingPercent } = quota;

  const color = getColorByPercent(consumedPercent, theme.colors);
  const availableColor = getAvailableColorByPercent(remainingPercent, theme.colors);

  const displayPercent = showAvailable ? remainingPercent : consumedPercent;
  const series = showAvailable
    ? [
        { value: remainingPercent, color: availableColor },
        { value: consumedPercent, color: theme.colors.border },
      ]
    : [
        { value: consumedPercent, color },
        { value: remainingPercent, color: theme.colors.border },
      ];

  const handleToggleView = () => {
    setShowAvailable(prev => !prev);
  };

  return (
    <Pressable
      style={[styles.container, { width: size, height: size }]}
      onPress={handleToggleView}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={t(showAvailable ? 'quota.toggleToUsed' : 'quota.toggleToAvailable')}
    >
      <View style={styles.chartContainer}>
        <PieChart widthAndHeight={size} series={series} cover={PIE_CHART_COVER} />
      </View>

      <View style={styles.centerContent}>
        <Text style={[styles.percentText, { fontSize: size * 0.18 }]}>
          {formatPercent(displayPercent)}
        </Text>
        <Text style={[styles.labelText, { fontSize: size * 0.08 }]}>
          {t(showAvailable ? 'quota.available' : 'quota.used')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
  },
  percentText: {
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  labelText: {
    color: theme.colors.icon,
    textTransform: 'uppercase',
    fontWeight: theme.typography.fontWeights.medium,
    marginTop: 4,
    opacity: 0.6,
  },
}));
