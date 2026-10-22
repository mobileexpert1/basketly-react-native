import { ApiClient } from '@/core/api/api-client';
import { ApiError } from '@/core/api/errors';
import type { HttpTransport } from '@/core/api/transport';
import { z } from 'zod';

import { memorySecureStorage } from '../../../../test/fixtures';
import { TokenManager, type Tokens } from './token-manager';

const NOW = 1_000_000;
const tokens = (access: string): Tokens => ({
  accessToken: access,
  refreshToken: `refresh-${access}`,
  expiresAt: NOW + 60 * 60_000,
});

function setup(refreshTokens: (refreshToken: string) => Promise<Tokens>) {
  const onExpired = jest.fn();
  const manager = new TokenManager({
    storage: memorySecureStorage(),
    refreshTokens,
    onExpired,
    now: () => NOW,
  });
  return { manager, onExpired };
}

describe('TokenManager', () => {
  it('shares a single refresh between concurrent 401 responses', async () => {
    const refresh = jest.fn(async () => tokens('fresh'));
    const { manager } = setup(refresh);
    await manager.save(tokens('stale'));

    const transport: HttpTransport = {
      send: async (request) =>
        request.headers.Authorization === 'Bearer fresh'
          ? { status: 200, body: { ok: true } }
          : { status: 401, body: null },
    };
    const api = new ApiClient(transport, manager);

    const results = await Promise.all(
      Array.from({ length: 5 }, () => api.request('/orders', z.object({ ok: z.boolean() }))),
    );

    expect(results).toHaveLength(5);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith('refresh-stale');
  });

  it('renews a token that is about to expire before using it', async () => {
    const refresh = jest.fn(async () => tokens('fresh'));
    const { manager } = setup(refresh);
    await manager.save({ ...tokens('old'), expiresAt: NOW + 5_000 });

    await expect(manager.accessToken()).resolves.toBe('fresh');
  });

  it('ends the session when the refresh token is rejected', async () => {
    const { manager, onExpired } = setup(async () => {
      throw new ApiError('unauthorized', 'expired', 401);
    });
    await manager.save(tokens('stale'));
    const api = new ApiClient({ send: async () => ({ status: 401, body: null }) }, manager);

    await expect(api.request('/cart', z.unknown())).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(onExpired).toHaveBeenCalled();
    await expect(manager.hasSession()).resolves.toBe(false);
  });

  it('keeps the session when the refresh fails because the device is offline', async () => {
    const { manager, onExpired } = setup(async () => {
      throw new ApiError('network', 'offline');
    });
    await manager.save(tokens('stale'));

    await expect(manager.refresh()).rejects.toMatchObject({ kind: 'network' });
    expect(onExpired).not.toHaveBeenCalled();
    await expect(manager.hasSession()).resolves.toBe(true);
  });
});
