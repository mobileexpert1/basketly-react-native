import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { AppTheme } from '../theme/tokens';

export type TextVariant = keyof AppTheme['typography'];
export type TextTone =
  'default' | 'muted' | 'primary' | 'accent' | 'danger' | 'success' | 'onPrimary';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({ variant = 'body', tone = 'default', style, ...props }: TextProps) {
  return <RNText {...props} style={[styles.text(variant, tone), style]} />;
}

const toneColor = (theme: AppTheme, tone: TextTone) =>
  ({
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    danger: theme.colors.danger,
    success: theme.colors.success,
    onPrimary: theme.colors.onPrimary,
  })[tone];

const styles = StyleSheet.create((theme) => ({
  text: (variant: TextVariant, tone: TextTone) => ({
    ...theme.typography[variant],
    color: toneColor(theme, tone),
  }),
}));
