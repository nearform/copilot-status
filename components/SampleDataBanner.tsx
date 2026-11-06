import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/** Shown in place of the "Updated" banner when a signed-out user is viewing sample data. */
export function SampleDataBanner() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <View style={styles.banner} accessibilityRole="summary">
      <View style={styles.textRow}>
        <Ionicons name="flask-outline" size={18} color={theme.colors.tint} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('sample.title')}</Text>
          <Text style={styles.message}>{t('sample.message')}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(auth)/login')}
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        <Ionicons name="logo-github" size={18} color={theme.colors.background} />
        <Text style={styles.buttonText}>{t('sample.connect')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  banner: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  textRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },
  message: {
    marginTop: 2,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.icon,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.tint,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
}));
