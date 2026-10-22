import { Ionicons } from '@expo/vector-icons';
import { setPrivacyScreenEnabled } from '@modules/privacy-screen';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useFormat } from '@/core/i18n/format';
import { translateError } from '@/core/i18n/translate-error';
import { Button } from '@/core/ui/button';
import { useIsOnline } from '@/core/ui/sync-banner';
import { Text } from '@/core/ui/text';
import { useContainer } from '@/di/container-context';
import { useSession } from '@/features/auth';
import { CartSummary, useCart } from '@/features/cart';
import { AddressForm, emptyAddress, orderNumber, usePlaceOrder } from '@/features/orders';
import { PaymentMethodCard } from '@/features/payments';
import { usePreferences } from '@/features/settings';

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const format = useFormat();
  const { payments } = useContainer();
  const user = useSession((state) => state.user);
  const online = useIsOnline();
  const { lines, totals } = useCart();
  const placeOrder = usePlaceOrder();

  useFocusEffect(
    useCallback(() => {
      void setPrivacyScreenEnabled(true);
      return () => void setPrivacyScreenEnabled(usePreferences.getState().appLock);
    }, []),
  );

  const result = placeOrder.data;
  if (result?.status === 'placed') {
    return <OrderConfirmed number={orderNumber(result.order)} email={result.order.address.email} />;
  }

  const error =
    result?.status === 'payment-failed'
      ? t('checkout.failed', { message: result.message })
      : placeOrder.error
        ? translateError(t, placeOrder.error)
        : !online
          ? t('checkout.offline')
          : null;

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.root} keyboardVerticalOffset={100}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text variant="heading">{t('checkout.summary')}</Text>
          <CartSummary totals={totals} />
        </View>

        <PaymentMethodCard method={payments.method} />

        <AddressForm
          defaultValues={{ ...emptyAddress, fullName: user?.name ?? '', email: user?.email ?? '' }}
          submitLabel={t('checkout.pay', {
            amount: format.money(totals.totalMinor, totals.currency ?? 'EUR'),
          })}
          submitting={placeOrder.isPending}
          disabled={!online || lines.length === 0}
          onSubmit={(address) => placeOrder.mutate({ lines, address })}
        />
        {error ? (
          <Text tone="danger" accessibilityLiveRegion="assertive" style={styles.center}>
            {error}
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function OrderConfirmed({ number, email }: { number: string; email: string }) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  return (
    <View style={styles.confirmed} testID="order-confirmed">
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={theme.colors.onPrimary} />
      </View>
      <Text variant="display" style={styles.center}>
        {t('checkout.successTitle')}
      </Text>
      <Text tone="muted" style={styles.center}>
        {t('checkout.successBody', { number, email })}
      </Text>
      <Button
        label={t('checkout.viewOrders')}
        onPress={() => {
          router.dismissAll();
          router.navigate('/orders');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },
  content: { gap: theme.space(6), padding: theme.space(5), paddingBottom: theme.space(12) },
  section: { gap: theme.space(3) },
  center: { textAlign: 'center' },
  confirmed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(4),
    padding: theme.space(8),
  },
  check: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    marginBottom: theme.space(2),
  },
}));
