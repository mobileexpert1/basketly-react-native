import { addItem } from '@/features/cart/domain/cart';
import type { PaymentProvider } from '@/features/payments/domain/payment-provider';

import { address, mug } from '../../../../test/fixtures';
import { OrderError } from './order';
import type { OrderRepository } from './order-repository';
import { placeOrder } from './place-order';

function setup(outcome: Awaited<ReturnType<PaymentProvider['pay']>>) {
  const orders: jest.Mocked<OrderRepository> = { list: jest.fn(), place: jest.fn() };
  const payments: jest.Mocked<PaymentProvider> = {
    method: { name: 'Test', testMode: true },
    pay: jest.fn().mockResolvedValue(outcome),
  };
  const deps = { orders, payments, newId: () => 'order-1', now: () => 1_000 };
  return { deps, orders, payments };
}

describe('placeOrder', () => {
  const lines = addItem([], mug, 2);

  it('charges the cart total and records the paid order', async () => {
    const { deps, orders, payments } = setup({ status: 'succeeded', reference: 'pay_1' });

    const result = await placeOrder(deps, lines, address);

    expect(payments.pay).toHaveBeenCalledWith({
      orderId: 'order-1',
      amountMinor: 3600 + 490,
      currency: 'EUR',
      email: address.email,
    });
    expect(result).toMatchObject({
      status: 'placed',
      order: { id: 'order-1', status: 'confirming' },
    });
    expect(orders.place).toHaveBeenCalledWith(
      expect.objectContaining({ paymentReference: 'pay_1' }),
    );
  });

  it.each([
    [{ status: 'canceled' } as const, { status: 'canceled' }],
    [
      { status: 'failed', message: 'Declined' } as const,
      { status: 'payment-failed', message: 'Declined' },
    ],
  ])('does not record an order when payment ends with %o', async (outcome, expected) => {
    const { deps, orders } = setup(outcome);
    await expect(placeOrder(deps, lines, address)).resolves.toEqual(expected);
    expect(orders.place).not.toHaveBeenCalled();
  });

  it('refuses an empty cart before taking payment', async () => {
    const { deps, payments } = setup({ status: 'succeeded', reference: 'x' });
    await expect(placeOrder(deps, [], address)).rejects.toEqual(new OrderError('empty-cart'));
    expect(payments.pay).not.toHaveBeenCalled();
  });
});
