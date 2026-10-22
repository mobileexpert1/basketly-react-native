import { DEMO_CREDENTIALS } from '@/features/auth/domain/session';
import { lineIdFor } from '@/features/cart/domain/cart';
import type { PaymentProvider } from '@/features/payments/domain/payment-provider';

import { createTestDatabase } from '../../test/database';
import { address, createServer, lamp, memorySecureStorage, mug } from '../../test/fixtures';
import { createContainer } from './container';

const payments: PaymentProvider = {
  method: { name: 'Test card', testMode: true },
  pay: async ({ orderId }) => ({ status: 'succeeded', reference: `pay_${orderId}` }),
};

async function setup() {
  const server = createServer();
  const secureStorage = memorySecureStorage();
  const onSessionExpired = jest.fn();
  const container = createContainer({
    env: { backend: 'mock', apiUrl: undefined, paymentProvider: 'mock' },
    backend: 'mock',
    db: await createTestDatabase(),
    secureStorage,
    onSessionExpired,
    transport: server,
    payments,
  });
  await container.auth.signIn(DEMO_CREDENTIALS);
  return { container, server, secureStorage };
}

describe('offline-first flow', () => {
  it('keeps cart edits made offline and uploads them when back online', async () => {
    const { container, server } = await setup();
    server.setOffline(true);

    await container.cart.add(mug, 2);
    await container.cart.add(lamp);
    await container.cart.setQuantity(lineIdFor(lamp.productId, lamp.variantId), 0);

    await expect(container.sync.sync()).resolves.toMatchObject({
      state: 'unreachable',
      pending: 2,
    });
    expect(await container.cart.lines()).toEqual([expect.objectContaining({ quantity: 2 })]);

    server.setOffline(false);
    await expect(container.sync.sync()).resolves.toMatchObject({ state: 'idle', pending: 0 });
    expect(await container.cart.lines()).toEqual([
      expect.objectContaining({ productId: mug.productId, quantity: 2 }),
    ]);
  });

  it('places an order that survives a lost connection after payment', async () => {
    const { container, server } = await setup();
    await container.cart.add(mug, 3);
    const lines = await container.cart.lines();

    server.setOffline(true);
    const result = await container.placeOrder(lines, address);
    expect(result.status).toBe('placed');
    expect(await container.cart.lines()).toEqual([]);
    expect((await container.orders.list())[0]?.status).toBe('confirming');

    await container.sync.sync();
    server.setOffline(false);
    await container.sync.sync();

    const [order] = await container.orders.list();
    expect(order).toMatchObject({ status: 'placed', totalMinor: 5400 + 490 });
  });

  it('wipes tokens and local data on sign-out', async () => {
    const { container, secureStorage } = await setup();
    await container.cart.add(mug);

    await container.signOut();

    expect(await container.cart.lines()).toEqual([]);
    expect(await container.auth.restore()).toBeNull();
    expect([...secureStorage.values.keys()]).not.toContain('auth.tokens');
  });
});
