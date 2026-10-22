import { z } from 'zod';

import { ApiClient } from './api-client';
import type { HttpTransport } from './transport';

const respond = (status: number, body: unknown): HttpTransport => ({
  send: async () => ({ status, body }),
});

describe('ApiClient', () => {
  it('validates responses at the boundary', async () => {
    const api = new ApiClient(respond(200, { id: 42 }));
    await expect(api.request('/x', z.object({ id: z.string() }))).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it.each([
    [404, 'rejected', false],
    [422, 'rejected', false],
    [503, 'server', true],
  ])('maps HTTP %i to %s', async (status, kind, isRetryable) => {
    const api = new ApiClient(respond(status, null));
    await expect(api.request('/x', z.unknown())).rejects.toMatchObject({ kind, isRetryable });
  });
});
