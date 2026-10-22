import { Children, isValidElement, type ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/core/ui/text';

export function SettingsGroup({
  title,
  footer,
  children,
}: {
  title: string;
  footer?: string;
  children: ReactNode;
}) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={styles.group}>
      <Text variant="label" tone="muted" style={styles.title} accessibilityRole="header">
        {title.toUpperCase()}
      </Text>
      <View style={styles.card}>
        {rows.map((row, index) => (
          <View key={row.key ?? index}>
            {index > 0 && <View style={styles.separator} />}
            {row}
          </View>
        ))}
      </View>
      {footer ? (
        <Text variant="caption" tone="muted" style={styles.title}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

interface SettingsRowProps {
  label: string;
  detail?: string;
  stacked?: boolean;
  children?: ReactNode;
}

export function SettingsRow({ label, detail, stacked = false, children }: SettingsRowProps) {
  return (
    <View style={styles.row(stacked)}>
      <View style={styles.labels}>
        <Text>{label}</Text>
        {detail ? (
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  group: { gap: theme.space(2) },
  title: { paddingHorizontal: theme.space(4), letterSpacing: 0.6 },
  card: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: theme.space(4),
    backgroundColor: theme.colors.border,
  },
  row: (stacked: boolean) => ({
    minHeight: 52,
    flexDirection: stacked ? 'column' : 'row',
    alignItems: stacked ? 'stretch' : 'center',
    gap: theme.space(3),
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(3),
  }),
  labels: { flexGrow: 1, flexShrink: 1, gap: 2 },
}));
