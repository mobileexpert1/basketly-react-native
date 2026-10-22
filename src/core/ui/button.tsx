import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  testID,
}: ButtonProps) {
  const { theme } = useUnistyles();
  styles.useVariants({ variant });
  const inactive = disabled || loading;
  const contentColor = variant === 'primary' ? theme.colors.onPrimary : theme.colors.primary;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[styles.button, inactive && styles.inactive]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={18} color={contentColor} />}
          <Text variant="heading" style={{ color: contentColor }}>
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.space(6),
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      variant: {
        primary: { backgroundColor: theme.colors.primary },
        secondary: { backgroundColor: theme.colors.surfaceMuted },
        ghost: { backgroundColor: 'transparent' },
      },
    },
  },
  inactive: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: theme.space(2) },
}));
