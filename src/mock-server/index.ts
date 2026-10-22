import { randomUUID } from 'expo-crypto';
import { Image } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

import type { Product } from '@/features/catalog/domain/product';

import { catalogFixtures } from './catalog';
import { productImages } from './images';
import { MockServer } from './mock-server';

export { MockServer };

export function demoProducts(resolve: (key: string) => string = resolveBundledImage): Product[] {
  return catalogFixtures.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      image: resolve(`${product.id}-${variant.id}`),
    })),
  }));
}

function resolveBundledImage(key: string) {
  const source = productImages[key];
  const uri = source === undefined ? undefined : Image.resolveAssetSource(source)?.uri;
  if (!uri) throw new Error(`Missing demo image ${key}`);
  return uri;
}

export function createMockServer() {
  const storage = createMMKV({ id: 'mock-server' });
  return new MockServer({
    storage: {
      load: () => storage.getString('state'),
      save: (state) => storage.set('state', state),
    },
    products: demoProducts(),
    latencyMs: () => 180 + Math.round(Math.random() * 220),
    newToken: () => randomUUID(),
  });
}
