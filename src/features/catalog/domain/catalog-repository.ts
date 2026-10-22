import type { Product } from './product';

export interface CatalogRepository {
  list(): Promise<Product[]>;
  get(id: string): Promise<Product>;
}
