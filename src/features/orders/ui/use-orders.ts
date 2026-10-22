import { onlineManager, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/core/api/errors';
import { useContainer } from '@/di/container-context';
import { queryKeys } from '@/di/query-keys';
import { useRequestSync } from '@/di/use-request-sync';
import type { CartLine } from '@/features/cart';

import type { Address } from '../domain/address';

export function useOrders() {
  const { orders } = useContainer();
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => orders.list(),
    networkMode: 'always',
    staleTime: Infinity,
  });
}

export function usePlaceOrder() {
  const container = useContainer();
  const queryClient = useQueryClient();
  const requestSync = useRequestSync();

  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ lines, address }: { lines: CartLine[]; address: Address }) => {
      if (!onlineManager.isOnline()) throw new ApiError('network', 'Offline');
      return container.placeOrder(lines, address);
    },
    onSuccess: (result) => {
      if (result.status !== 'placed') return;
      queryClient.setQueryData(queryKeys.cart, []);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      requestSync();
    },
  });
}
