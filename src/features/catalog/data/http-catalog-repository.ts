import { z } from 'zod';

import type { ApiClient } from '@/core/api/api-client';

import type { CatalogRepository } from '../domain/catalog-repository';

export const VariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  swatch: z.string().regex(/^#[0-9a-f]{6}$/i),
  image: z.string().min(1),
  stock: z.number().int().nonnegative(),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string(),
  description: z.string(),
  category: z.string(),
  priceMinor: z.number().int().nonnegative(),
  currency: z.string().length(3),
  rating: z.number().min(0).max(5),
  variants: z.array(VariantSchema).min(1),
});

const ProductListSchema = z.object({ items: z.array(ProductSchema) });

export class HttpCatalogRepository implements CatalogRepository {
  constructor(private readonly api: ApiClient) {}

  async list() {
    const { items } = await this.api.request('/products', ProductListSchema);
    return items;
  }

  get(id: string) {
    return this.api.request(`/products/${encodeURIComponent(id)}`, ProductSchema);
  }
}
