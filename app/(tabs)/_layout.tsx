import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useCopilotQuota } from '@/hooks/useGitHub';
import { hasPremiumQuota } from '@/utils/quotaUtils';
import { useTranslation } from 'react-i18next';
import { useUnistyles } from 'react-native-unistyles';

export default function TabLayout() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { data: quotas } = useCopilotQuota();

  const hasPremium = hasPremiumQuota(quotas);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: t('quota.types.premium_interactions'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="sparkles" color={color} />,
          // href: null hides the tab — see https://docs.expo.dev/router/advanced/tabs/#hiding-a-tab
          href: hasPremium ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('quota.types.chat'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="chatbubbles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="completions"
        options={{
          title: t('quota.types.completions'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="code-slash" color={color} />,
        }}
      />
    </Tabs>
  );
}
