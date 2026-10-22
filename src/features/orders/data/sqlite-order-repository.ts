import { desc, eq, like } from 'drizzle-orm';

import type { AppDatabase } from '@/core/db/database';
import { cartItems, orders, outbox } from '@/core/db/schema';
import { enqueue } from '@/core/sync/outbox';
import type { ChangeHandler } from '@/core/sync/sync-engine';

import type { Order, OrderStatus } from '../domain/order';
import type { OrderRepository } from '../domain/order-repository';
import type { OrderApi } from './order-api';

const ORDER_CREATE = 'order.create';

type Details = Pick<
  Order,
  'lines' | 'address' | 'subtotalMinor' | 'shippingMinor' | 'paymentReference'
>;

const toRow = (order: Order, synced: boolean) => {
  const { id, status, createdAt, totalMinor, currency, ...details } = order;
  return { id, status, createdAt, totalMinor, currency, details: details as Details, synced };
};

export class SqliteOrderRepository implements OrderRepository {
  constructor(private readonly db: AppDatabase) {}

  async list(): Promise<Order[]> {
    return this.db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .all()
      .map(({ details, synced: _synced, ...row }) => ({
        ...row,
        ...(details as Details),
        status: row.status as OrderStatus,
      }));
  }

  async place(order: Order) {
    this.db.transaction((tx) => {
      tx.insert(orders).values(toRow(order, false)).run();
      enqueue(tx, { entityKey: `order:${order.id}`, type: ORDER_CREATE, payload: order });
      // The server empties its cart when it accepts the order, so pending cart edits are obsolete.
      tx.delete(cartItems).run();
      tx.delete(outbox).where(like(outbox.entityKey, 'cart:%')).run();
    });
  }

  confirm(id: string, status: OrderStatus) {
    this.db.update(orders).set({ status, synced: true }).where(eq(orders.id, id)).run();
  }

  applyRemote(remote: readonly Order[]) {
    this.db.transaction((tx) => {
      for (const order of remote) {
        tx.insert(orders)
          .values(toRow(order, true))
          .onConflictDoUpdate({ target: orders.id, set: { status: order.status, synced: true } })
          .run();
      }
    });
  }
}

export function orderSyncHandlers(
  api: OrderApi,
  repository: SqliteOrderRepository,
): Record<string, ChangeHandler> {
  return {
    [ORDER_CREATE]: async ({ payload }) => {
      const confirmed = await api.create(payload as Order);
      repository.confirm(confirmed.id, confirmed.status);
    },
  };
}
