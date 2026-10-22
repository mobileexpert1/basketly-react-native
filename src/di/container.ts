import { randomUUID } from 'expo-crypto';

import { ApiClient } from '@/core/api/api-client';
import { FetchTransport, type HttpTransport } from '@/core/api/transport';
import type { Backend, Env } from '@/core/config/env';
import type { AppDatabase } from '@/core/db/database';
import { wipeUserData } from '@/core/db/wipe';
import type { SecureStorage } from '@/core/storage/secure-storage';
import { OutboxStore } from '@/core/sync/outbox';
import { SyncEngine, type SyncSnapshot } from '@/core/sync/sync-engine';
import { HttpAuthRepository, refreshTokens } from '@/features/auth/data/http-auth-repository';
import { TokenManager } from '@/features/auth/data/token-manager';
import type { AuthRepository } from '@/features/auth/domain/session';
import { CartApi } from '@/features/cart/data/cart-api';
import {
  cartSyncHandlers,
  SqliteCartRepository,
} from '@/features/cart/data/sqlite-cart-repository';
import type { CartLine } from '@/features/cart/domain/cart';
import type { CartRepository } from '@/features/cart/domain/cart-repository';
import { HttpCatalogRepository } from '@/features/catalog/data/http-catalog-repository';
import type { CatalogRepository } from '@/features/catalog/domain/catalog-repository';
import { OrderApi } from '@/features/orders/data/order-api';
import {
  orderSyncHandlers,
  SqliteOrderRepository,
} from '@/features/orders/data/sqlite-order-repository';
import type { Address } from '@/features/orders/domain/address';
import type { OrderRepository } from '@/features/orders/domain/order-repository';
import { placeOrder, type PlaceOrderResult } from '@/features/orders/domain/place-order';
import type { PaymentProvider } from '@/features/payments/domain/payment-provider';
import { createMockServer, type MockServer } from '@/mock-server';

import { createPaymentProvider } from './payment-providers';

export interface Container {
  backend: Backend;
  mockServer: MockServer | null;
  auth: AuthRepository;
  catalog: CatalogRepository;
  cart: CartRepository;
  orders: OrderRepository;
  payments: PaymentProvider;
  sync: SyncEngine;
  placeOrder(lines: readonly CartLine[], address: Address): Promise<PlaceOrderResult>;
  signOut(): Promise<void>;
}

export interface ContainerOptions {
  env: Env;
  backend: Backend;
  db: AppDatabase;
  secureStorage: SecureStorage;
  onSessionExpired: () => void;
  onSyncChange?: (snapshot: SyncSnapshot) => void;
  transport?: HttpTransport;
  payments?: PaymentProvider;
}

const SIGN_OUT_SYNC_TIMEOUT_MS = 3_000;

export function createContainer(options: ContainerOptions): Container {
  const { env, backend, db, secureStorage } = options;

  const mockServer = !options.transport && backend === 'mock' ? createMockServer() : null;
  const transport: HttpTransport =
    options.transport ?? mockServer ?? new FetchTransport(env.apiUrl!);

  const publicApi = new ApiClient(transport);
  const tokens = new TokenManager({
    storage: secureStorage,
    refreshTokens: (refreshToken) => refreshTokens(publicApi, refreshToken),
    onExpired: options.onSessionExpired,
  });
  const api = new ApiClient(transport, tokens);

  const cart = new SqliteCartRepository(db);
  const orders = new SqliteOrderRepository(db);
  const cartApi = new CartApi(api);
  const orderApi = new OrderApi(api);

  const sync = new SyncEngine({
    outbox: new OutboxStore(db),
    handlers: { ...cartSyncHandlers(cartApi), ...orderSyncHandlers(orderApi, orders) },
    pullers: [
      async () => cart.applyRemote(await cartApi.fetch()),
      async () => orders.applyRemote(await orderApi.list()),
    ],
    onChange: options.onSyncChange,
  });

  const payments = options.payments ?? createPaymentProvider(env.paymentProvider, api);

  const auth = new HttpAuthRepository(publicApi, tokens, secureStorage);

  return {
    backend,
    mockServer,
    auth,
    catalog: new HttpCatalogRepository(api),
    cart,
    orders,
    payments,
    sync,
    placeOrder: (lines, address) =>
      placeOrder({ orders, payments, newId: randomUUID, now: Date.now }, lines, address),
    async signOut() {
      await withTimeout(sync.sync(), SIGN_OUT_SYNC_TIMEOUT_MS).catch(() => undefined);
      await auth.signOut();
      wipeUserData(db);
      sync.refreshPending();
    },
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => (timer = setTimeout(resolve, ms)));
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
