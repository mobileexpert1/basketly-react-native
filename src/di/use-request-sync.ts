import { onlineManager, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useContainer } from './container-context';
import { localQueryKeys } from './query-keys';

export function useRequestSync() {
  const { sync } = useContainer();
  const queryClient = useQueryClient();

  return useCallback(() => {
    sync.refreshPending();
    if (!onlineManager.isOnline()) return;
    void sync.sync().then(() => {
      for (const queryKey of localQueryKeys) void queryClient.invalidateQueries({ queryKey });
    });
  }, [sync, queryClient]);
}
