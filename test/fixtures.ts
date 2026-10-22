import type { NewCartItem } from '@/features/cart/domain/cart';
import type { Address } from '@/features/orders/domain/address';
import type { SecureStorage } from '@/core/storage/secure-storage';
import { demoProducts } from '@/mock-server';
import { MockServer } from '@/mock-server/mock-server';

export const products = demoProducts((key) => `https://cdn.example.com/${key}.webp`);

export const mug: NewCartItem = {
  productId: 'stoneware-mug',
  variantId: 'sand',
  title: 'Stoneware Mug',
  variantName: 'Sand',
  image: 'https://cdn.example.com/mug.webp',
  unitPriceMinor: 1800,
  currency: 'EUR',
};

export const lamp: NewCartItem = {
  productId: 'arc-desk-lamp',
  variantId: 'ivory',
  title: 'Arc Desk Lamp',
  variantName: 'Ivory',
  image: 'https://cdn.example.com/lamp.webp',
  unitPriceMinor: 12000,
  currency: 'EUR',
};

export const address: Address = {
  fullName: 'Alex Morgan',
  email: 'demo@basketly.app',
  line1: 'Torstraße 1',
  line2: '',
  city: 'Berlin',
  postalCode: '10119',
  country: 'DE',
};

let counter = 0;

export function createServer(options: Partial<ConstructorParameters<typeof MockServer>[0]> = {}) {
  return new MockServer({ products, newToken: () => `token-${++counter}`, ...options });
}

export function memorySecureStorage(): SecureStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    get: async (key) => values.get(key) ?? null,
    set: async (key, value) => void values.set(key, value),
    delete: async (key) => void values.delete(key),
  };
}
