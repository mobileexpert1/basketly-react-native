import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useFormat } from '@/core/i18n/format';
import { Text } from '@/core/ui/text';

import { orderItemCount, type Order, type OrderStatus } from '../domain/order';

export const orderNumber = (order: Order) => order.id.slice(0, 8).toUpperCase();

export function OrderCard({ order }: { order: Order }) {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <View style={styles.card} testID={`order-${order.id}`}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text variant="label">{t('orders.number', { number: orderNumber(order) })}</Text>
          <Text variant="caption" tone="muted">
            {format.date(order.createdAt)} · {t('orders.items', { count: orderItemCount(order) })}
          </Text>
        </View>
        <StatusPill status={order.status} />
      </View>
      <View style={styles.footer}>
        <View style={styles.thumbs}>
          {order.lines.slice(0, 4).map((line) => (
            <Image
              key={`${line.productId}:${line.variantId}`}
              source={line.image}
              style={styles.thumb}
              accessibilityLabel={`${line.title}, ${line.variantName}`}
            />
          ))}
        </View>
        <Text variant="heading">{format.money(order.totalMinor, order.currency)}</Text>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  return (
    <View style={styles.pill(status)}>
      <Text variant="caption" tone={status === 'confirming' ? 'accent' : 'primary'}>
        {t(`orders.status.${status}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.space(4),
    padding: theme.space(4),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space(3) },
  titles: { flex: 1, gap: 2 },
  pill: (status: OrderStatus) => ({
    paddingHorizontal: theme.space(2.5),
    paddingVertical: theme.space(1),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: status === 'confirming' ? 1 : 0,
    borderColor: theme.colors.accent,
  }),
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  thumbs: { flexDirection: 'row', gap: theme.space(1.5) },
  thumb: { width: 44, height: 44, borderRadius: theme.radius.sm },
}));
