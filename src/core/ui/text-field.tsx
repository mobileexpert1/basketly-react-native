import type { ComponentRef, Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from './text';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

export function TextField({ label, error, style, ref, ...props }: TextFieldProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.primary}
        style={[styles.input(Boolean(error)), style]}
        {...props}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.space(1.5) },
  input: (invalid: boolean) => ({
    ...theme.typography.body,
    minHeight: 50,
    paddingHorizontal: theme.space(4),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: invalid ? theme.colors.danger : theme.colors.border,
    color: theme.colors.text,
  }),
}));
