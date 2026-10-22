import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import type { Variant } from '../domain/product';

interface ProductGalleryProps {
  variants: Variant[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export function ProductGallery({ variants, selectedIndex, onIndexChange }: ProductGalleryProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const offset = useScrollOffset(scrollRef);
  const settledIndex = useRef(selectedIndex);

  useEffect(() => {
    if (settledIndex.current === selectedIndex) return;
    settledIndex.current = selectedIndex;
    scrollRef.current?.scrollTo({ x: selectedIndex * width, animated: true });
  }, [selectedIndex, width, scrollRef]);

  return (
    <View>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          settledIndex.current = index;
          if (index !== selectedIndex) onIndexChange(index);
        }}
      >
        {variants.map((variant, index) => (
          <Image
            key={variant.id}
            source={variant.image}
            style={{ width, height: width }}
            contentFit="cover"
            transition={150}
            accessibilityLabel={`${variant.name}. ${t('product.galleryLabel', {
              index: index + 1,
              total: variants.length,
            })}`}
          />
        ))}
      </Animated.ScrollView>
      {variants.length > 1 && (
        <View style={styles.dots} pointerEvents="none">
          {variants.map((variant, index) => (
            <Dot key={variant.id} index={index} offset={offset} width={width} />
          ))}
        </View>
      )}
    </View>
  );
}

function Dot({
  index,
  offset,
  width,
}: {
  index: number;
  offset: SharedValue<number>;
  width: number;
}) {
  const animated = useAnimatedStyle(() => {
    const progress = interpolate(
      offset.value / width,
      [index - 1, index, index + 1],
      [0, 1, 0],
      'clamp',
    );
    return { width: 6 + progress * 14, opacity: 0.35 + progress * 0.65 };
  });
  return <Animated.View style={[styles.dot, animated]} />;
}

const styles = StyleSheet.create((theme) => ({
  dots: {
    position: 'absolute',
    bottom: theme.space(4),
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { height: 6, borderRadius: 3, backgroundColor: theme.colors.text },
}));
