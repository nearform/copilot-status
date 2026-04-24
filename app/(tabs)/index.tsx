import { useCopilotQuota } from '@/hooks/useGitHub';
import { hasPremiumQuota } from '@/utils/quotaUtils';
import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function DefaultTab() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { data: quotas, isLoading } = useCopilotQuota();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.tint} />
        <Text style={styles.loadingText}>{t('dashboard.loadingQuota')}</Text>
      </View>
    );
  }

  const hasPremium = hasPremiumQuota(quotas);

  return <Redirect href={hasPremium ? '/(tabs)/premium' : '/(tabs)/chat'} />;
}

const styles = StyleSheet.create(theme => ({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.icon,
  },
}));
