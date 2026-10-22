import { useQuery, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';

import { useContainer } from '@/di/container-context';
import { queryKeys } from '@/di/query-keys';

import { filterProducts, type CatalogFilter, type Category, type Product } from '../domain/product';

interface CatalogFilterStore extends CatalogFilter {
  setQuery: (query: string) => void;
  setCategory: (category: Category | null) => void;
}

export const useCatalogFilter = create<CatalogFilterStore>((set) => ({
  query: '',
  category: null,
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
}));

export function useProducts() {
  const { catalog } = useContainer();
  const query = useCatalogFilter((state) => state.query);
  const category = useCatalogFilter((state) => state.category);

  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => catalog.list(),
    meta: { persist: true },
    staleTime: 5 * 60_000,
    select: (products) => filterProducts(products, { query, category }),
  });
}

export function useProduct(id: string) {
  const { catalog } = useContainer();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => catalog.get(id),
    meta: { persist: true },
    placeholderData: () =>
      queryClient.getQueryData<Product[]>(queryKeys.products)?.find((product) => product.id === id),
  });
}
