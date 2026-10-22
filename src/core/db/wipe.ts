import type { AppDatabase } from './database';
import { cartItems, orders, outbox } from './schema';

export function wipeUserData(db: AppDatabase) {
  db.transaction((tx) => {
    tx.delete(cartItems).run();
    tx.delete(orders).run();
    tx.delete(outbox).run();
  });
}
