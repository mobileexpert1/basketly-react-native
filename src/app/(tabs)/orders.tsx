import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { EmptyState } from '@/core/ui/empty-state';
import { ScreenHeader } from '@/core/ui/screen-header';
import { SyncBanner } from '@/core/ui/sync-banner';
import { OrderCard, useOrders } from '@/features/orders';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const orders = useOrders();
  const items = orders.data ?? [];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <ScreenHeader title={t('orders.title')} />
      <SyncBanner />
      {!orders.isPending && items.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={t('orders.empty')}
          body={t('orders.emptyHint')}
          action={{ label: t('cart.browse'), onPress: () => router.navigate('/') }}
        />
      ) : (
        <View style={styles.list}>
          {items.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { gap: theme.space(4), padding: theme.space(5), paddingTop: theme.space(4) },
  list: { gap: theme.space(3) },
}));
