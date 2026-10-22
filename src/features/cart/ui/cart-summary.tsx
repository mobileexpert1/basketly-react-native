import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useFormat } from '@/core/i18n/format';
import { Text } from '@/core/ui/text';

import {
  amountToFreeShipping,
  FREE_SHIPPING_THRESHOLD_MINOR,
  type CartTotals,
} from '../domain/cart';

export function CartSummary({ totals }: { totals: CartTotals }) {
  const { t } = useTranslation();
  const format = useFormat();
  const currency = totals.currency ?? 'EUR';
  const missing = amountToFreeShipping(totals);
  const progress = Math.min(1, totals.subtotalMinor / FREE_SHIPPING_THRESHOLD_MINOR);
  const [trackWidth, setTrackWidth] = useState(0);
  const bar = useAnimatedStyle(() => ({
    width: withSpring(progress * trackWidth, { damping: 20 }),
  }));

  return (
    <View style={styles.card}>
      <View style={styles.shipping}>
        <Text variant="caption" tone={missing === 0 ? 'success' : 'muted'}>
          {missing === 0
            ? t('cart.freeShippingUnlocked')
            : t('cart.freeShippingProgress', { amount: format.money(missing, currency) })}
        </Text>
        <View style={styles.track} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
          <Animated.View style={[styles.fill, bar]} />
        </View>
      </View>
      <Row label={t('cart.subtotal')} value={format.money(totals.subtotalMinor, currency)} />
      <Row
        label={t('cart.shipping')}
        value={
          totals.shippingMinor === 0 ? t('cart.free') : format.money(totals.shippingMinor, currency)
        }
      />
      <View style={styles.divider} />
      <Row label={t('cart.total')} value={format.money(totals.totalMinor, currency)} strong />
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant={strong ? 'heading' : 'body'} tone={strong ? 'default' : 'muted'}>
        {label}
      </Text>
      <Text variant={strong ? 'title' : 'body'}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.space(2.5),
    padding: theme.space(4),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  shipping: { gap: theme.space(2), marginBottom: theme.space(1) },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border },
}));
