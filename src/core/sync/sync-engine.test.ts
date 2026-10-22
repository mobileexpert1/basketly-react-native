import { ApiError } from '../api/errors';
import type { AppDatabase } from '../db/database';
import { createTestDatabase } from '../../../test/database';
import { enqueue, OutboxStore } from './outbox';
import { MAX_ATTEMPTS, SyncEngine } from './sync-engine';

describe('SyncEngine', () => {
  let db: AppDatabase;
  let outbox: OutboxStore;

  beforeEach(async () => {
    db = await createTestDatabase();
    outbox = new OutboxStore(db);
  });

  const change = (key: string, payload: unknown = {}) =>
    enqueue(db, { entityKey: key, type: 'test', payload });

  it('coalesces repeated changes to the same entity', () => {
    change('cart:a', { quantity: 1 });
    change('cart:a', { quantity: 3 });
    expect(outbox.pending()).toEqual([
      expect.objectContaining({ entityKey: 'cart:a', payload: { quantity: 3 }, version: 2 }),
    ]);
  });

  it('pushes in order, then pulls', async () => {
    change('a');
    change('b');
    const calls: string[] = [];
    const engine = new SyncEngine({
      outbox,
      handlers: { test: async (entry) => void calls.push(entry.entityKey) },
      pullers: [async () => void calls.push('pull')],
    });

    await expect(engine.sync()).resolves.toMatchObject({ state: 'idle', pending: 0 });
    expect(calls).toEqual(['a', 'b', 'pull']);
  });

  it('pauses on network errors and keeps the queue', async () => {
    change('a');
    const engine = new SyncEngine({
      outbox,
      handlers: {
        test: async () => {
          throw new ApiError('network', 'offline');
        },
      },
    });

    await expect(engine.sync()).resolves.toMatchObject({ state: 'unreachable', pending: 1 });
    expect(outbox.pending()[0]?.attempts).toBe(0);
  });

  it('parks a rejected change and continues with the rest', async () => {
    change('bad');
    change('good');
    const pushed: string[] = [];
    const engine = new SyncEngine({
      outbox,
      handlers: {
        test: async (entry) => {
          if (entry.entityKey === 'bad') throw new ApiError('rejected', 'invalid', 422);
          pushed.push(entry.entityKey);
        },
      },
    });

    for (let i = 0; i < MAX_ATTEMPTS + 2; i++) await engine.sync();

    expect(pushed).toEqual(['good']);
    expect(outbox.pending()).toEqual([
      expect.objectContaining({ entityKey: 'bad', attempts: MAX_ATTEMPTS }),
    ]);
  });

  it('keeps a change that was edited while its upload was in flight', async () => {
    change('a', { quantity: 1 });
    const engine = new SyncEngine({
      outbox,
      handlers: { test: async () => void change('a', { quantity: 2 }) },
    });

    await engine.sync();

    expect(outbox.pending()).toEqual([expect.objectContaining({ payload: { quantity: 2 } })]);
  });

  it('runs one sync at a time and one more pass when asked during a run', async () => {
    change('a');
    let release!: () => void;
    const handler = jest.fn(() => new Promise<void>((resolve) => (release = resolve)));
    const engine = new SyncEngine({ outbox, handlers: { test: handler } });

    const first = engine.sync();
    const second = engine.sync();
    expect(second).toBe(first);
    await Promise.resolve();
    release();
    await first;

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
