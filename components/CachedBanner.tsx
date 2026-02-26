import { formatTime } from '@/utils/dateTimeUtils';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CachedBannerProps {
  lastFetch: Date;
}

export function CachedBanner({ lastFetch }: CachedBannerProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color={theme.colors.icon} />
      <Text style={styles.text}>
        {t('cached.usingCachedData')} · {t('cached.updated')} {formatTime(t, lastFetch)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 10,
    gap: theme.spacing.xs,
  },
  text: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.icon,
  },
}));
