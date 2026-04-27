import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { useUnistyles } from 'react-native-unistyles';

export default function TabLayout() {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

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
          title: t('quota.types.premium_interactions'),
          tabBarIcon: ({ color }) => <Ionicons size={24} name="sparkles" color={color} />,
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
