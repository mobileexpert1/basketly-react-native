import type { CartLine, NewCartItem } from './cart';

export interface CartRepository {
  lines(): Promise<CartLine[]>;
  add(item: NewCartItem, quantity?: number): Promise<void>;
  setQuantity(lineId: string, quantity: number): Promise<void>;
}
