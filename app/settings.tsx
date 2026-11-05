import { RadioButton } from '@/components/RadioButton';
import { Separator } from '@/components/Separator';
import { SettingsCategory } from '@/components/settings/SettingsCategory';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsVoice } from '@/components/settings/SettingsVoice';
import { useUser } from '@/hooks/useUserData';
import { useAuthStore } from '@/stores/auth';
import { useQuotaStore } from '@/stores/quota';
import { useThemeStore } from '@/stores/theme';
import { goBackOrHome } from '@/utils/navigation';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function SettingsScreen() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { signOut, isAuthenticated } = useAuthStore();
  const { clearQuota } = useQuotaStore();
  const { themePreference, setThemePreference } = useThemeStore();
  const { data: user } = useUser();
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSignOut = () => {
    Alert.alert(t('settings.signOutConfirmTitle'), t('settings.signOutConfirmMessage'), [
      { text: t('settings.cancel'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          clearQuota();
          goBackOrHome();
        },
      },
    ]);
  };

  const avatarUrl = user?.login ? `https://github.com/${user.login}.png` : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <SettingsSection>
        <View style={styles.userCard}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={32} color={theme.colors.icon} />
            </View>
          )}
          {isAuthenticated ? (
            <View style={styles.userInfo}>
              <Text style={styles.username}>
                {user?.name ?? user?.login ?? t('common.unknown')}
              </Text>
              <Text style={styles.userSubtitle}>
                {t('settings.signedInAs', { username: user?.login ?? t('common.unknown') })}
              </Text>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.username}>{t('settings.notConnected')}</Text>
              <Text style={styles.userSubtitle}>{t('settings.notConnectedSubtitle')}</Text>
            </View>
          )}
        </View>
      </SettingsSection>

      <SettingsCategory title="settings.appearance">
        <RadioButton
          value="light"
          i18nPrefix="settings"
          selected={themePreference === 'light'}
          onSelect={setThemePreference}
          icon="sunny-outline"
        />
        <Separator />
        <RadioButton
          value="dark"
          i18nPrefix="settings"
          selected={themePreference === 'dark'}
          onSelect={setThemePreference}
          icon="moon-outline"
        />
        <Separator />
        <RadioButton
          value="system"
          i18nPrefix="settings"
          selected={themePreference === 'system'}
          onSelect={setThemePreference}
          icon="phone-portrait-outline"
        />
      </SettingsCategory>

      <SettingsCategory title="settings.actions">
        {isAuthenticated ? (
          <TouchableOpacity style={styles.row} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={theme.colors.critical} />
            <Text style={[styles.rowText, styles.destructiveText]}>{t('settings.signOut')}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.icon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.row} onPress={() => router.push('/(auth)/login')}>
            <Ionicons name="logo-github" size={22} color={theme.colors.tint} />
            <Text style={[styles.rowText, styles.connectText]}>{t('settings.connectGitHub')}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.icon} />
          </TouchableOpacity>
        )}
      </SettingsCategory>

      <SettingsCategory title="settings.about">
        <SettingsVoice
          icon="information-circle-outline"
          text="settings.appName"
          value="common.appName"
        />
        <Separator />
        <SettingsVoice icon="code-outline" text="settings.version" value={appVersion} />
        <Separator />
        <SettingsVoice
          icon="code-download"
          text="settings.sourceCode"
          value="settings.github"
          onPress={() => Linking.openURL(t('settings.repoLink'))}
        />
        <Separator />
        <SettingsVoice
          icon="man-outline"
          text="settings.author"
          value="settings.authorName"
          onPress={() => Linking.openURL(t('settings.authorProfile'))}
        />
      </SettingsCategory>

      <SettingsSection>
        <Text style={styles.rowText}>{t('settings.disclaimer')}</Text>
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes['5xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: theme.spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: '#FFFFFF1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
  },
  rowText: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  username: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.icon,
  },
  destructiveText: {
    color: theme.colors.critical,
  },
  connectText: {
    color: theme.colors.tint,
  },
}));
