import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useFormat } from '@/core/i18n/format';
import { translateError } from '@/core/i18n/translate-error';
import { Button } from '@/core/ui/button';
import { EmptyState } from '@/core/ui/empty-state';
import { Text } from '@/core/ui/text';
import { FREE_SHIPPING_THRESHOLD_MINOR, useAddToCart } from '@/features/cart';
import {
  defaultVariant,
  isInStock,
  ProductGallery,
  useProduct,
  VariantPicker,
} from '@/features/catalog';

const FEW_LEFT = 5;

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const format = useFormat();
  const product = useProduct(id);
  const addToCart = useAddToCart();
  const [index, setIndex] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  if (!product.data) {
    return product.isError ? (
      <EmptyState
        icon="alert-circle-outline"
        title={translateError(t, product.error)}
        action={{ label: t('common.retry'), onPress: () => void product.refetch() }}
      />
    ) : (
      <ActivityIndicator style={styles.loading} />
    );
  }

  const item = product.data;
  const selectedIndex = index ?? Math.max(0, item.variants.indexOf(defaultVariant(item)!));
  const variant = item.variants[selectedIndex]!;
  const available = isInStock(variant);

  const add = () => {
    addToCart.mutate({
      item: {
        productId: item.id,
        variantId: variant.id,
        title: item.title,
        variantName: variant.name,
        image: variant.image,
        unitPriceMinor: item.priceMinor,
        currency: item.currency,
      },
    });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setJustAdded(true);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={styles.scroll}>
        <ProductGallery
          variants={item.variants}
          selectedIndex={selectedIndex}
          onIndexChange={setIndex}
        />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titles}>
              <Text variant="title" accessibilityRole="header">
                {item.title}
              </Text>
              <Text tone="muted">{item.subtitle}</Text>
            </View>
            <Text variant="title">{format.money(item.priceMinor, item.currency)}</Text>
          </View>
          <View
            style={styles.meta}
            accessibilityLabel={t('product.rating', { rating: item.rating })}
          >
            <Ionicons name="star" size={14} color={theme.colors.accent} />
            <Text variant="label">{item.rating.toFixed(1)}</Text>
            <Text
              variant="caption"
              tone={available ? (variant.stock <= FEW_LEFT ? 'accent' : 'success') : 'danger'}
            >
              ·{' '}
              {!available
                ? t('product.soldOut')
                : variant.stock <= FEW_LEFT
                  ? t('product.fewLeft', { count: variant.stock })
                  : t('product.inStock')}
            </Text>
          </View>
          <VariantPicker variants={item.variants} selectedId={variant.id} onSelect={setIndex} />
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.perk}>
            <Ionicons name="cube-outline" size={18} color={theme.colors.primary} />
            <Text variant="caption" tone="muted">
              {t('product.freeShipping', {
                amount: format.money(FREE_SHIPPING_THRESHOLD_MINOR, item.currency),
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bar}>
        {justAdded ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.added}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text variant="heading" tone="success">
              {t('product.added')}
            </Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn}>
            <Button
              label={available ? t('product.addToCart') : t('product.soldOut')}
              icon="bag-add-outline"
              disabled={!available}
              onPress={add}
              testID="add-to-cart"
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  loading: { marginTop: theme.space(24) },
  scroll: { paddingBottom: theme.space(28) },
  body: { gap: theme.space(5), padding: theme.space(5) },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space(3) },
  titles: { flex: 1, gap: theme.space(1) },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(1.5),
    marginTop: -theme.space(2),
  },
  description: { color: theme.colors.textMuted, lineHeight: 23 },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(2),
    padding: theme.space(3),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.space(5),
    paddingTop: theme.space(3),
    paddingBottom: rt.insets.bottom + theme.space(3),
    backgroundColor: theme.colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  added: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space(2),
  },
}));
