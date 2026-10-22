import type { HttpRequest } from '@/core/api/transport';

import { address, createServer } from '../../test/fixtures';

const request = (overrides: Partial<HttpRequest>): HttpRequest => ({
  method: 'GET',
  path: '/',
  headers: {},
  ...overrides,
});

async function signIn(server: ReturnType<typeof createServer>) {
  const { body } = await server.send(
    request({
      method: 'POST',
      path: '/auth/login',
      body: { email: 'demo@basketly.app', password: 'basketly-demo' },
    }),
  );
  return body as { accessToken: string; refreshToken: string };
}

describe('MockServer', () => {
  it('rejects wrong credentials and unauthenticated requests', async () => {
    const server = createServer();
    const login = await server.send(
      request({
        method: 'POST',
        path: '/auth/login',
        body: { email: 'demo@basketly.app', password: 'nope' },
      }),
    );
    expect(login.status).toBe(401);
    expect((await server.send(request({ path: '/cart' }))).status).toBe(401);
  });

  it('rotates refresh tokens so each can be used once', async () => {
    const server = createServer();
    const { refreshToken } = await signIn(server);
    const refresh = () =>
      server.send(request({ method: 'POST', path: '/auth/refresh', body: { refreshToken } }));

    expect((await refresh()).status).toBe(200);
    expect((await refresh()).status).toBe(401);
  });

  it('creates an order once per idempotency key', async () => {
    const server = createServer();
    const { accessToken } = await signIn(server);
    const order = {
      id: 'order-1',
      createdAt: 1,
      status: 'confirming',
      lines: [],
      address,
      currency: 'EUR',
      subtotalMinor: 0,
      shippingMinor: 0,
      totalMinor: 0,
      paymentReference: 'pay_1',
    };
    const post = () =>
      server.send(
        request({
          method: 'POST',
          path: '/orders',
          body: order,
          headers: { Authorization: `Bearer ${accessToken}`, 'Idempotency-Key': 'order-1' },
        }),
      );

    expect((await post()).status).toBe(201);
    expect(await post()).toMatchObject({ status: 200, body: { status: 'placed' } });
    const list = await server.send(
      request({ path: '/orders', headers: { Authorization: `Bearer ${accessToken}` } }),
    );
    expect((list.body as { items: unknown[] }).items).toHaveLength(1);
  });

  it('fails like a dropped connection while offline', async () => {
    const server = createServer();
    server.setOffline(true);
    await expect(server.send(request({ path: '/products' }))).rejects.toMatchObject({
      kind: 'network',
    });
  });
});

describe('MockServer persistence', () => {
  it('restores sessions and orders from storage', async () => {
    let saved: string | undefined;
    const storage = { load: () => saved, save: (state: string) => void (saved = state) };
    const { accessToken } = await signIn(createServer({ storage }));

    const restarted = createServer({ storage });
    const cart = await restarted.send(
      request({ path: '/cart', headers: { Authorization: `Bearer ${accessToken}` } }),
    );
    expect(cart.status).toBe(200);
  });
});
