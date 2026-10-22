import type { Order } from './order';

export interface OrderRepository {
  list(): Promise<Order[]>;
  place(order: Order): Promise<void>;
}
