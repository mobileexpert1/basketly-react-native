import { cartTotals, type CartLine } from '@/features/cart/domain/cart';

import type { Address } from './address';

export type OrderStatus = 'confirming' | 'placed' | 'shipped' | 'delivered';

export type OrderLine = Omit<CartLine, 'id'>;

export interface Order {
  id: string;
  createdAt: number;
  status: OrderStatus;
  lines: OrderLine[];
  address: Address;
  currency: string;
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  paymentReference: string;
}

export class OrderError extends Error {
  constructor(readonly code: 'empty-cart' | 'mixed-currency') {
    super(code);
    this.name = 'OrderError';
  }
}

export function assertOrderable(lines: readonly CartLine[]) {
  if (lines.length === 0) throw new OrderError('empty-cart');
  if (new Set(lines.map((line) => line.currency)).size > 1) throw new OrderError('mixed-currency');
}

export function createOrder(input: {
  id: string;
  lines: readonly CartLine[];
  address: Address;
  paymentReference: string;
  now: number;
}): Order {
  assertOrderable(input.lines);
  const totals = cartTotals(input.lines);
  return {
    id: input.id,
    createdAt: input.now,
    status: 'confirming',
    lines: input.lines.map(({ id: _id, ...line }) => line),
    address: input.address,
    currency: totals.currency!,
    subtotalMinor: totals.subtotalMinor,
    shippingMinor: totals.shippingMinor,
    totalMinor: totals.totalMinor,
    paymentReference: input.paymentReference,
  };
}

export const orderItemCount = (order: Order) =>
  order.lines.reduce((sum, line) => sum + line.quantity, 0);
