import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/core/ui/button';
import { EmptyState } from '@/core/ui/empty-state';
import { ScreenHeader } from '@/core/ui/screen-header';
import { SyncBanner } from '@/core/ui/sync-banner';
import { CartLineRow, CartSummary, useCart, useSetQuantity } from '@/features/cart';

export default function CartScreen() {
  const { t } = useTranslation();
  const { lines, totals, isPending } = useCart();
  const setQuantity = useSetQuantity();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <ScreenHeader
        title={t('cart.title')}
        eyebrow={totals.itemCount > 0 ? t('cart.items', { count: totals.itemCount }) : undefined}
      />
      <SyncBanner />
      {!isPending && lines.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title={t('cart.empty')}
          body={t('cart.emptyHint')}
          action={{ label: t('cart.browse'), onPress: () => router.navigate('/') }}
        />
      ) : (
        <>
          <View style={styles.lines}>
            {lines.map((line) => (
              <CartLineRow
                key={line.id}
                line={line}
                onQuantityChange={(quantity) => setQuantity.mutate({ lineId: line.id, quantity })}
              />
            ))}
          </View>
          {lines.length > 0 && (
            <>
              <CartSummary totals={totals} />
              <Button
                label={t('cart.checkout')}
                icon="arrow-forward"
                onPress={() => router.push('/checkout')}
                testID="checkout-button"
              />
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { gap: theme.space(4), padding: theme.space(5), paddingTop: theme.space(4) },
  lines: { gap: theme.space(3) },
}));
