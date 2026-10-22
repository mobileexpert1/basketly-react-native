import { asc, eq, inArray, notInArray } from 'drizzle-orm';

import type { AppDatabase } from '@/core/db/database';
import { cartItems } from '@/core/db/schema';
import { enqueue, OutboxStore } from '@/core/sync/outbox';
import type { ChangeHandler } from '@/core/sync/sync-engine';

import { clampQuantity, lineIdFor, type CartLine, type NewCartItem } from '../domain/cart';
import type { CartRepository } from '../domain/cart-repository';
import type { CartApi, CartLinePayload } from './cart-api';

export const CART_KEY_PREFIX = 'cart:';
const CART_PUT = 'cart.put';
const CART_DELETE = 'cart.delete';

const entityKey = (lineId: string) => `${CART_KEY_PREFIX}${lineId}`;

export class SqliteCartRepository implements CartRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly now: () => number = Date.now,
  ) {}

  async lines(): Promise<CartLine[]> {
    return this.db
      .select()
      .from(cartItems)
      .orderBy(asc(cartItems.addedAt), asc(cartItems.id))
      .all()
      .map(({ addedAt: _addedAt, ...line }) => line);
  }

  async add(item: NewCartItem, quantity = 1) {
    const id = lineIdFor(item.productId, item.variantId);
    this.db.transaction((tx) => {
      const existing = tx.select().from(cartItems).where(eq(cartItems.id, id)).get();
      const next = clampQuantity((existing?.quantity ?? 0) + quantity);
      if (next === 0) return;
      tx.insert(cartItems)
        .values({ ...item, id, quantity: next, addedAt: this.now() })
        .onConflictDoUpdate({ target: cartItems.id, set: { quantity: next } })
        .run();
      enqueuePut(tx, id, { productId: item.productId, variantId: item.variantId, quantity: next });
    });
  }

  async setQuantity(lineId: string, quantity: number) {
    const next = clampQuantity(quantity);
    this.db.transaction((tx) => {
      const existing = tx.select().from(cartItems).where(eq(cartItems.id, lineId)).get();
      if (!existing) return;
      if (next === 0) {
        tx.delete(cartItems).where(eq(cartItems.id, lineId)).run();
        enqueue(tx, { entityKey: entityKey(lineId), type: CART_DELETE, payload: { lineId } });
        return;
      }
      tx.update(cartItems).set({ quantity: next }).where(eq(cartItems.id, lineId)).run();
      enqueuePut(tx, lineId, {
        productId: existing.productId,
        variantId: existing.variantId,
        quantity: next,
      });
    });
  }

  applyRemote(remote: readonly CartLine[]) {
    const pending = new OutboxStore(this.db).pendingKeys(CART_KEY_PREFIX);
    const settled = (id: string) => !pending.has(entityKey(id));
    const remoteIds = remote.map((line) => line.id);

    this.db.transaction((tx) => {
      const stale = tx
        .select({ id: cartItems.id })
        .from(cartItems)
        .where(remoteIds.length ? notInArray(cartItems.id, remoteIds) : undefined)
        .all()
        .map((row) => row.id)
        .filter(settled);
      if (stale.length) tx.delete(cartItems).where(inArray(cartItems.id, stale)).run();

      for (const line of remote) {
        if (!settled(line.id)) continue;
        tx.insert(cartItems)
          .values({ ...line, addedAt: this.now() })
          .onConflictDoUpdate({
            target: cartItems.id,
            set: { quantity: line.quantity, unitPriceMinor: line.unitPriceMinor },
          })
          .run();
      }
    });
  }
}

function enqueuePut(db: AppDatabase, lineId: string, payload: CartLinePayload) {
  enqueue(db, { entityKey: entityKey(lineId), type: CART_PUT, payload: { lineId, ...payload } });
}

export function cartSyncHandlers(api: CartApi): Record<string, ChangeHandler> {
  return {
    [CART_PUT]: ({ payload }) => {
      const { lineId, ...body } = payload as CartLinePayload & { lineId: string };
      return api.put(lineId, body);
    },
    [CART_DELETE]: ({ payload }) => api.remove((payload as { lineId: string }).lineId),
  };
}
