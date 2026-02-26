'use client';

import { CachedBanner } from '@/components/CachedBanner';
import { QuotaValues } from '@/components/QuotaValues';
import { useCopilotQuota } from '@/hooks/useGitHub';
import type { QuotaType } from '@/types/quota';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface QuotaScreenProps {
  quotaType: QuotaType;
}

export function QuotaDisplay({ quotaType }: QuotaScreenProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { data: quotas, isFetching, error, refetch } = useCopilotQuota();

  if (isFetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.tint} />
        <Text style={styles.loadingText}>{t('dashboard.loadingQuota')}</Text>
      </View>
    );
  }

  if (error?.message) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>{t('dashboard.unableToLoad')}</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  if (!quotas?.hasSubscription) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('dashboard.noSubscription')}</Text>
      </View>
    );
  }

  const quota = quotas[quotaType];

  return (
    <>
      <CachedBanner lastFetch={quota.lastUpdated} />
      <View style={styles.content}>
        <QuotaValues quota={quota} onRefresh={refetch} isRefreshing={isFetching} />
      </View>
    </>
  );
}

const styles = StyleSheet.create(theme => ({
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.icon,
  },
  errorTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.icon,
    textAlign: 'center',
  },
}));
