import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useFormat } from '@/core/i18n/format';
import { Text } from '@/core/ui/text';

import type { CartLine } from '../domain/cart';
import { QuantityStepper } from './quantity-stepper';

interface CartLineRowProps {
  line: CartLine;
  onQuantityChange: (quantity: number) => void;
}

export function CartLineRow({ line, onQuantityChange }: CartLineRowProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const format = useFormat();

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18)}
      exiting={FadeOut.duration(180)}
    >
      <ReanimatedSwipeable
        friction={1.6}
        rightThreshold={60}
        overshootRight={false}
        onSwipeableOpen={() => onQuantityChange(0)}
        renderRightActions={() => (
          <View style={styles.deleteAction}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.onPrimary} />
          </View>
        )}
      >
        <View style={styles.row}>
          <Image source={line.image} style={styles.image} contentFit="cover" />
          <View style={styles.info}>
            <Text variant="label" numberOfLines={1}>
              {line.title}
            </Text>
            <Text variant="caption" tone="muted">
              {line.variantName}
            </Text>
            <Text variant="heading" style={styles.price}>
              {format.money(line.unitPriceMinor * line.quantity, line.currency)}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              hitSlop={8}
              onPress={() => onQuantityChange(0)}
              accessibilityRole="button"
              accessibilityLabel={`${t('cart.remove')} ${line.title}`}
            >
              <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            </Pressable>
            <QuantityStepper
              value={line.quantity}
              onChange={onQuantityChange}
              testID={`qty-${line.productId}`}
            />
          </View>
        </View>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    gap: theme.space(3),
    padding: theme.space(3),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  image: { width: 84, height: 84, borderRadius: theme.radius.md },
  info: { flex: 1, gap: 2, justifyContent: 'center' },
  price: { marginTop: theme.space(1) },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  deleteAction: {
    width: 88,
    marginLeft: theme.space(3),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
