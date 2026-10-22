import { cartTotals, type CartLine } from '@/features/cart/domain/cart';
import type { PaymentProvider } from '@/features/payments/domain/payment-provider';

import type { Address } from './address';
import { assertOrderable, createOrder, type Order } from './order';
import type { OrderRepository } from './order-repository';

export type PlaceOrderResult =
  | { status: 'placed'; order: Order }
  | { status: 'canceled' }
  | { status: 'payment-failed'; message: string };

interface Dependencies {
  orders: OrderRepository;
  payments: PaymentProvider;
  newId: () => string;
  now: () => number;
}

/** Once paid, the order is queued locally and retried until the server confirms it. */
export async function placeOrder(
  deps: Dependencies,
  lines: readonly CartLine[],
  address: Address,
): Promise<PlaceOrderResult> {
  assertOrderable(lines);
  const id = deps.newId();
  const totals = cartTotals(lines);

  const payment = await deps.payments.pay({
    orderId: id,
    amountMinor: totals.totalMinor,
    currency: totals.currency!,
    email: address.email,
  });
  if (payment.status === 'canceled') return payment;
  if (payment.status === 'failed') return { status: 'payment-failed', message: payment.message };

  const order = createOrder({
    id,
    lines,
    address,
    paymentReference: payment.reference,
    now: deps.now(),
  });
  await deps.orders.place(order);
  return { status: 'placed', order };
}
