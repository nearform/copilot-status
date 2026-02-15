import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import * as BackgroundTask from 'expo-background-task';

interface StatsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
}

export function StatsCard({ icon, label, value, color }: StatsCardProps) {
  const { theme } = useUnistyles();
  const iconColor = color ?? theme.colors.tint;

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text
          style={styles.label}
          onPress={() => BackgroundTask.triggerTaskWorkerForTestingAsync()}
        >
          {label}
        </Text>
        <Text style={styles.value}>{value.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.icon,
    marginBottom: 4,
  },
  value: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },
}));
