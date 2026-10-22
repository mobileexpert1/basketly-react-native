import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '@/core/ui/text';

import type { PaymentMethod } from '../domain/payment-provider';

export function PaymentMethodCard({ method }: { method: PaymentMethod }) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <View style={styles.card(method.testMode)} testID="payment-method">
      <Ionicons name="card-outline" size={20} color={theme.colors.accent} />
      <View style={styles.text}>
        <Text variant="label">
          {method.detail ? `${method.name} ${method.detail}` : method.name}
        </Text>
        {method.testMode && (
          <Text variant="caption" tone="muted">
            {t('checkout.testMode')}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: (testMode: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    padding: theme.space(4),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: testMode ? 1 : 0,
    borderStyle: 'dashed',
    borderColor: theme.colors.accent,
  }),
  text: { flex: 1, gap: 2 },
}));
