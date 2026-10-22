import { create } from 'zustand';

import type { SyncSnapshot } from './sync-engine';

export const useSyncStore = create<SyncSnapshot>(() => ({
  state: 'idle',
  pending: 0,
  lastSyncedAt: null,
}));
