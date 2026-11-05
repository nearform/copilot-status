import { DEMO_TOKEN } from '@/constants/demo';
import { useGitHubAuthRequest } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import { storeToken } from '@/stores/secureStorage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const DEMO_TAP_THRESHOLD = 5;

export default function LoginScreen() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [request, , promptAsync] = useGitHubAuthRequest();
  const { signIn, isLoading, error, clearError } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);
  const tapCount = useRef(0);

  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(30));

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
  }, [fadeAnim, slideAnim]);

  const handleSignIn = async (code: string) => {
    try {
      await signIn(code, request?.codeVerifier);
    } catch {
      setLocalLoading(false);
    }
  };

  const handlePress = async () => {
    clearError();
    setLocalLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        await handleSignIn(result.params.code);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDemoLoginTrigger = () => {
    tapCount.current += 1;
    if (tapCount.current >= DEMO_TAP_THRESHOLD) {
      tapCount.current = 0;
      storeToken(DEMO_TOKEN).then(() => {
        useAuthStore.setState({ isAuthenticated: true });
      });
    }
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

        <Pressable onPress={handleDemoLoginTrigger}>
          <Text style={styles.footer}>{t('login.footer')}</Text>
        </Pressable>
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
  footer: {
    marginTop: theme.spacing.xl,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.icon,
    textAlign: 'center',
    lineHeight: theme.typography.fontSizes.xs * theme.typography.lineHeights.normal,
    opacity: 0.7,
  },
}));
