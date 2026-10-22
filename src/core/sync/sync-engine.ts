import { isApiError } from '../api/errors';

import type { OutboxEntry, OutboxStore } from './outbox';

export const MAX_ATTEMPTS = 5;

export type ChangeHandler = (entry: OutboxEntry) => Promise<void>;
export type Puller = () => Promise<void>;

export type SyncState = 'idle' | 'syncing' | 'unreachable' | 'unauthorized';

export interface SyncSnapshot {
  state: SyncState;
  pending: number;
  lastSyncedAt: number | null;
}

export interface SyncEngineOptions {
  outbox: OutboxStore;
  handlers: Record<string, ChangeHandler>;
  pullers?: Puller[];
  onChange?: (snapshot: SyncSnapshot) => void;
  now?: () => number;
}

/** One run at a time. Network errors pause the queue; a rejected change is parked so the rest continue. */
export class SyncEngine {
  private running: Promise<SyncSnapshot> | null = null;
  private rerun = false;
  private snapshot: SyncSnapshot;

  constructor(private readonly options: SyncEngineOptions) {
    this.snapshot = { state: 'idle', pending: options.outbox.count(), lastSyncedAt: null };
  }

  get current() {
    return this.snapshot;
  }

  sync(): Promise<SyncSnapshot> {
    if (this.running) {
      this.rerun = true;
      return this.running;
    }
    this.running = this.loop().finally(() => {
      this.running = null;
    });
    return this.running;
  }

  refreshPending() {
    this.update({ pending: this.options.outbox.count() });
  }

  private async loop(): Promise<SyncSnapshot> {
    this.update({ state: 'syncing' });
    let state: SyncState;
    do {
      this.rerun = false;
      state = await this.pass();
    } while (this.rerun && state === 'idle');

    const now = this.options.now?.() ?? Date.now();
    this.update({
      state,
      pending: this.options.outbox.count(),
      lastSyncedAt: state === 'idle' ? now : this.snapshot.lastSyncedAt,
    });
    return this.snapshot;
  }

  private async pass(): Promise<SyncState> {
    const { outbox, handlers, pullers = [] } = this.options;

    for (const entry of outbox.pending()) {
      if (entry.attempts >= MAX_ATTEMPTS) continue;
      const handler = handlers[entry.type];
      if (!handler) {
        outbox.fail(entry, `No handler for ${entry.type}`);
        continue;
      }
      try {
        await handler(entry);
        outbox.complete(entry);
      } catch (error) {
        const stop = stopState(error);
        if (stop) return stop;
        outbox.fail(entry, error instanceof Error ? error.message : String(error));
      }
    }

    try {
      for (const pull of pullers) await pull();
    } catch (error) {
      return stopState(error) ?? 'idle';
    }
    return 'idle';
  }

  private update(patch: Partial<SyncSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.options.onChange?.(this.snapshot);
  }
}

function stopState(error: unknown): SyncState | null {
  if (!isApiError(error)) return null;
  if (error.kind === 'unauthorized') return 'unauthorized';
  return error.isRetryable ? 'unreachable' : null;
}
