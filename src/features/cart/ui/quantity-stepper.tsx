import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '@/core/ui/text';

import { MAX_LINE_QUANTITY } from '../domain/cart';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  testID?: string;
}

export function QuantityStepper({ value, onChange, testID }: QuantityStepperProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View
      style={styles.container}
      accessibilityRole="adjustable"
      accessibilityLabel={t('cart.quantity', { count: value })}
      accessibilityValue={{ min: 0, max: MAX_LINE_QUANTITY, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={({ nativeEvent }) =>
        onChange(nativeEvent.actionName === 'increment' ? value + 1 : value - 1)
      }
      testID={testID}
    >
      <Pressable
        hitSlop={8}
        onPress={() => onChange(value - 1)}
        accessibilityLabel={t('cart.decrease')}
        style={styles.button}
        testID={testID && `${testID}-decrease`}
      >
        <Ionicons
          name={value === 1 ? 'trash-outline' : 'remove'}
          size={16}
          color={theme.colors.text}
        />
      </Pressable>
      <Text variant="label" style={styles.value}>
        {value}
      </Text>
      <Pressable
        hitSlop={8}
        disabled={value >= MAX_LINE_QUANTITY}
        onPress={() => onChange(value + 1)}
        accessibilityLabel={t('cart.increase')}
        style={[styles.button, value >= MAX_LINE_QUANTITY && styles.disabled]}
        testID={testID && `${testID}-increase`}
      >
        <Ionicons name="add" size={16} color={theme.colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  button: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.35 },
  value: { minWidth: 20, textAlign: 'center', fontVariant: ['tabular-nums'] },
}));
