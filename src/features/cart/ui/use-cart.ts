import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useContainer } from '@/di/container-context';
import { queryKeys } from '@/di/query-keys';
import { useRequestSync } from '@/di/use-request-sync';

import { addItem, cartTotals, setQuantity, type CartLine, type NewCartItem } from '../domain/cart';

export function useCart() {
  const { cart } = useContainer();
  const query = useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => cart.lines(),
    networkMode: 'always',
    staleTime: Infinity,
  });
  const lines = query.data ?? [];
  return { ...query, lines, totals: cartTotals(lines) };
}

function useCartMutation<T>(
  write: (input: T) => Promise<void>,
  apply: (lines: CartLine[], input: T) => CartLine[],
) {
  const queryClient = useQueryClient();
  const requestSync = useRequestSync();

  return useMutation({
    mutationFn: write,
    networkMode: 'always',
    onMutate: async (input: T) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });
      const previous = queryClient.getQueryData<CartLine[]>(queryKeys.cart);
      queryClient.setQueryData<CartLine[]>(queryKeys.cart, (lines = []) => apply(lines, input));
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(queryKeys.cart, context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      requestSync();
    },
  });
}

export function useAddToCart() {
  const { cart } = useContainer();
  return useCartMutation<{ item: NewCartItem; quantity?: number }>(
    ({ item, quantity }) => cart.add(item, quantity),
    (lines, { item, quantity }) => addItem(lines, item, quantity),
  );
}

export function useSetQuantity() {
  const { cart } = useContainer();
  return useCartMutation<{ lineId: string; quantity: number }>(
    ({ lineId, quantity }) => cart.setQuantity(lineId, quantity),
    (lines, { lineId, quantity }) => setQuantity(lines, lineId, quantity),
  );
}
