import { and, asc, count, eq, like, sql } from 'drizzle-orm';

import type { AppDatabase } from '../db/database';
import { outbox } from '../db/schema';

export interface Change {
  entityKey: string;
  type: string;
  payload: unknown;
}

export interface OutboxEntry extends Change {
  version: number;
  attempts: number;
}

export function enqueue(db: AppDatabase, change: Change, now = Date.now()) {
  db.insert(outbox)
    .values({ ...change, createdAt: now })
    .onConflictDoUpdate({
      target: outbox.entityKey,
      set: {
        type: change.type,
        payload: change.payload,
        version: sql`${outbox.version} + 1`,
        attempts: 0,
        lastError: null,
      },
    })
    .run();
}

export class OutboxStore {
  constructor(private readonly db: AppDatabase) {}

  pending(): OutboxEntry[] {
    return this.db
      .select({
        entityKey: outbox.entityKey,
        type: outbox.type,
        payload: outbox.payload,
        version: outbox.version,
        attempts: outbox.attempts,
      })
      .from(outbox)
      .orderBy(asc(outbox.createdAt), asc(outbox.entityKey))
      .all();
  }

  count(): number {
    return this.db.select({ value: count() }).from(outbox).get()?.value ?? 0;
  }

  /** Only removes the entry if it was not edited while the upload was in flight. */
  complete(entry: OutboxEntry) {
    this.db
      .delete(outbox)
      .where(and(eq(outbox.entityKey, entry.entityKey), eq(outbox.version, entry.version)))
      .run();
  }

  fail(entry: OutboxEntry, error: string) {
    this.db
      .update(outbox)
      .set({ attempts: sql`${outbox.attempts} + 1`, lastError: error })
      .where(and(eq(outbox.entityKey, entry.entityKey), eq(outbox.version, entry.version)))
      .run();
  }

  pendingKeys(prefix: string): Set<string> {
    const rows = this.db
      .select({ key: outbox.entityKey })
      .from(outbox)
      .where(like(outbox.entityKey, `${prefix}%`))
      .all();
    return new Set(rows.map((row) => row.key));
  }
}
