import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/core/ui/text';

import { isInStock, type Variant } from '../domain/product';

interface VariantPickerProps {
  variants: Variant[];
  selectedId: string;
  onSelect: (index: number) => void;
}

export function VariantPicker({ variants, selectedId, onSelect }: VariantPickerProps) {
  const { t } = useTranslation();
  const selected = variants.find((variant) => variant.id === selectedId);

  return (
    <View style={styles.container}>
      <Text variant="label" tone="muted">
        {t('product.color')} · <Text variant="label">{selected?.name}</Text>
      </Text>
      <View style={styles.row} accessibilityRole="radiogroup">
        {variants.map((variant, index) => {
          const active = variant.id === selectedId;
          const available = isInStock(variant);
          return (
            <Pressable
              key={variant.id}
              accessibilityRole="radio"
              accessibilityLabel={
                available ? variant.name : `${variant.name}, ${t('product.soldOut')}`
              }
              accessibilityState={{ selected: active }}
              hitSlop={6}
              onPress={() => onSelect(index)}
              style={styles.ring(active)}
              testID={`variant-${variant.id}`}
            >
              <View style={styles.swatch(variant.swatch)}>
                {!available && <View style={styles.strike} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.space(3) },
  row: { flexDirection: 'row', gap: theme.space(3) },
  ring: (active: boolean) => ({
    padding: 3,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: active ? theme.colors.primary : 'transparent',
  }),
  swatch: (color: string) => ({
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }),
  strike: {
    width: 44,
    height: 2,
    backgroundColor: theme.colors.surface,
    transform: [{ rotate: '-45deg' }],
  },
}));
