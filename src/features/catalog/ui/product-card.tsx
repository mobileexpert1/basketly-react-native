import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useFormat } from '@/core/i18n/format';
import { PressableScale } from '@/core/ui/pressable-scale';
import { Text } from '@/core/ui/text';

import { defaultVariant, isSoldOut, type Product } from '../domain/product';

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const format = useFormat();
  const cover = defaultVariant(product);
  const soldOut = isSoldOut(product);
  const price = format.money(product.priceMinor, product.currency);

  return (
    <Link href={{ pathname: '/product/[id]', params: { id: product.id } }} asChild>
      <PressableScale
        style={styles.card}
        accessibilityLabel={`${product.title}, ${price}`}
        testID={`product-${product.id}`}
      >
        <View style={styles.imageWrap}>
          <Image source={cover?.image} style={styles.image} contentFit="cover" transition={200} />
          {soldOut && (
            <View style={styles.badge}>
              <Text variant="caption">{t('catalog.soldOut')}</Text>
            </View>
          )}
        </View>
        <View style={styles.body}>
          <Text variant="label" numberOfLines={1}>
            {product.title}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {product.subtitle}
          </Text>
          <View style={styles.footer}>
            <Text variant="heading">{price}</Text>
            <View style={styles.swatches}>
              {product.variants.slice(0, 3).map((variant) => (
                <View key={variant.id} style={styles.swatch(variant.swatch)} />
              ))}
            </View>
          </View>
        </View>
      </PressableScale>
    </Link>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  imageWrap: { aspectRatio: 1, backgroundColor: theme.colors.surfaceMuted },
  image: { flex: 1 },
  badge: {
    position: 'absolute',
    top: theme.space(2.5),
    left: theme.space(2.5),
    paddingHorizontal: theme.space(2),
    paddingVertical: theme.space(1),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
  },
  body: { padding: theme.space(3), gap: 2 },
  footer: {
    marginTop: theme.space(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swatches: { flexDirection: 'row', gap: 3 },
  swatch: (color: string) => ({
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  }),
}));
