import type { QuotaInfo } from '@/types/quota';
import { formatFullDate, getDailyQuotaInsight } from '@/utils/dateTimeUtils';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { CircularProgress } from './CircularProgress';
import { StatsCard } from './StatsCard';

interface QuotaValuesProps {
  quota: QuotaInfo;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function QuotaValues({ quota, onRefresh, isRefreshing }: QuotaValuesProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  const dailyQuota = quota.unlimited
    ? null
    : getDailyQuotaInsight(quota.remainingQuota, quota.resetDate);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.text}
        />
      }
    >
      <View style={styles.progressContainer}>
        <CircularProgress quota={quota} size={200} />
      </View>

      <View style={styles.statsContainer}>
        {dailyQuota ? (
          <>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <StatsCard
                  icon="code-slash"
                  label={t('quota.used')}
                  value={quota.usedQuota}
                  color={theme.colors.good}
                />
              </View>
              <View style={styles.halfWidth}>
                <StatsCard
                  icon="trending-down-outline"
                  label={t('quota.dailyAverage')}
                  value={t('quota.perDay', {
                    count: dailyQuota.dailyAverage,
                  })}
                  color={theme.colors.tint}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <StatsCard
                  icon="stop-circle"
                  label={t('quota.totalLimit')}
                  value={quota.totalQuota}
                  color={theme.colors.critical}
                />
              </View>
              <View style={styles.halfWidth}>
                <StatsCard
                  icon="code-working-outline"
                  label={t('quota.remaining')}
                  value={quota.remainingQuota}
                  color={theme.colors.warning}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <StatsCard
                  icon="time-outline"
                  label={t('quota.daysRemaining')}
                  value={dailyQuota.daysRemaining}
                  color={theme.colors.tint}
                />
              </View>
            </View>
          </>
        ) : (
          <StatsCard
            icon="infinite-outline"
            label={t('quota.unlimited')}
            value={'∞'}
            color={theme.colors.good}
          />
        )}

        <StatsCard
          icon="calendar-outline"
          label={t('quota.resetsAt')}
          value={formatFullDate(t, quota.resetDate)}
          color={theme.colors.tint}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  statsContainer: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfWidth: {
    flex: 1,
    minWidth: 0,
  },
  unlimitedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  unlimitedIcon: {
    fontSize: 120,
    color: theme.colors.tint,
    fontWeight: theme.typography.fontWeights.normal,
  },
  unlimitedText: {
    fontSize: theme.typography.fontSizes['2xl'],
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.semibold,
    marginTop: theme.spacing.md,
  },
}));
