import { StyleSheet } from 'react-native-unistyles';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.chip(selected)}
    >
      <Text variant="label" tone={selected ? 'onPrimary' : 'default'}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create((theme) => ({
  chip: (selected: boolean) => ({
    height: 36,
    paddingHorizontal: theme.space(4),
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
    borderWidth: 1,
    borderColor: selected ? theme.colors.primary : theme.colors.border,
  }),
}));
