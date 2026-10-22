import { z } from 'zod';

import type { ApiClient } from '@/core/api/api-client';
import { isApiError } from '@/core/api/errors';

import type { CartLine } from '../domain/cart';

export const CartLineSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  variantId: z.string().min(1),
  title: z.string(),
  variantName: z.string(),
  image: z.string(),
  unitPriceMinor: z.number().int().nonnegative(),
  currency: z.string().length(3),
  quantity: z.number().int().positive(),
});

export interface CartLinePayload {
  productId: string;
  variantId: string;
  quantity: number;
}

const path = (lineId: string) => `/cart/items/${encodeURIComponent(lineId)}`;

export class CartApi {
  constructor(private readonly api: ApiClient) {}

  async fetch(): Promise<CartLine[]> {
    const result = await this.api.request('/cart', z.object({ items: z.array(CartLineSchema) }));
    return result.items;
  }

  async put(lineId: string, payload: CartLinePayload) {
    await this.api.request(path(lineId), z.unknown(), { method: 'PUT', body: payload });
  }

  async remove(lineId: string) {
    try {
      await this.api.request(path(lineId), z.unknown(), { method: 'DELETE' });
    } catch (error) {
      if (isApiError(error) && error.status === 404) return;
      throw error;
    }
  }
}
