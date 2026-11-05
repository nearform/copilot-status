import { useGitHubAuthRequest } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import { goBackOrHome } from '@/utils/navigation';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function LoginScreen() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [request, , promptAsync] = useGitHubAuthRequest();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = async () => {
    clearError();
    setLocalLoading(true);
    try {
      // Handle the result here, not in an effect on `response`. On Android the
      // OAuth redirect also arrives as a deep link, and Expo Router navigates to
      // it, which can unmount this screen before such an effect runs.
      const result = await promptAsync();
      if (result.type === 'success') {
        await signIn(result.params.code, request?.codeVerifier);
      }
    } catch {
      // signIn records the error in the store for display.
    } finally {
      setLocalLoading(false);
    }
  };

  const handleNotNow = () => {
    clearError();
    goBackOrHome();
  };

  const showLoading = isLoading || localLoading;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="pulse" size={64} color={theme.colors.tint} />
        </View>

        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.critical} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, showLoading && styles.buttonDisabled]}
          onPress={handlePress}
          disabled={!request || showLoading}
          activeOpacity={0.8}
        >
          {showLoading ? (
            <ActivityIndicator color={theme.colors.background} size="small" />
          ) : (
            <>
              <Ionicons
                name="logo-github"
                size={24}
                color={theme.colors.background}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>{t('login.signInButton')}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleNotNow}
          disabled={showLoading}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>{t('login.notNow')}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>{t('login.footer')}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSizes['4xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.icon,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: theme.typography.fontSizes.md * theme.typography.lineHeights.relaxed,
    paddingHorizontal: theme.spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF44441A',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  errorText: {
    color: theme.colors.critical,
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.tint,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    ...theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  secondaryButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryButtonText: {
    color: theme.colors.tint,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  footer: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.icon,
    textAlign: 'center',
    lineHeight: theme.typography.fontSizes.xs * theme.typography.lineHeights.normal,
    opacity: 0.7,
  },
}));
