import { z } from 'zod';

import type { ApiClient } from '@/core/api/api-client';

import { COUNTRIES } from '../domain/address';
import type { Order } from '../domain/order';

const OrderLineSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  title: z.string(),
  variantName: z.string(),
  image: z.string(),
  unitPriceMinor: z.number().int().nonnegative(),
  currency: z.string().length(3),
  quantity: z.number().int().positive(),
});

export const OrderSchema = z.object({
  id: z.string().min(1),
  createdAt: z.number().int(),
  // Unknown statuses from a newer API must not fail the whole list.
  status: z.enum(['confirming', 'placed', 'shipped', 'delivered']).catch('placed'),
  lines: z.array(OrderLineSchema).min(1),
  address: z.object({
    fullName: z.string(),
    email: z.string(),
    line1: z.string(),
    line2: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.enum(COUNTRIES),
  }),
  currency: z.string().length(3),
  subtotalMinor: z.number().int(),
  shippingMinor: z.number().int(),
  totalMinor: z.number().int(),
  paymentReference: z.string(),
});

export class OrderApi {
  constructor(private readonly api: ApiClient) {}

  async list(): Promise<Order[]> {
    const { items } = await this.api.request('/orders', z.object({ items: z.array(OrderSchema) }));
    return items;
  }

  create(order: Order): Promise<Order> {
    return this.api.request('/orders', OrderSchema, {
      method: 'POST',
      body: order,
      headers: { 'Idempotency-Key': order.id },
    });
  }
}
