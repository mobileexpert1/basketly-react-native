import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import Constants from 'expo-constants';

import { isApiError } from '@/core/api/errors';
import { kv } from '@/core/storage/kv-storage';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 24 * 60 * 60_000,
        retry: (failureCount, error) => isApiError(error) && error.isRetryable && failureCount < 2,
      },
    },
  });
}

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: createAsyncStoragePersister({
    key: 'query-cache',
    storage: {
      getItem: async (key) => kv.getString(key) ?? null,
      setItem: async (key, value) => kv.set(key, value),
      removeItem: async (key) => {
        kv.remove(key);
      },
    },
  }),
  maxAge: 7 * 24 * 60 * 60_000,
  buster: Constants.expoConfig?.version ?? '1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.meta?.persist === true && query.state.status === 'success',
  },
};
