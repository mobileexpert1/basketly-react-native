import { ApiError } from '@/core/api/errors';
import type { HttpRequest, HttpResponse, HttpTransport } from '@/core/api/transport';
import type { CartLine } from '@/features/cart/domain/cart';
import type { Product } from '@/features/catalog/domain/product';
import type { Order } from '@/features/orders/domain/order';
import { DEMO_CREDENTIALS } from '@/features/auth/domain/session';

import { DEMO_USER } from './demo-account';

interface Session {
  refreshToken: string;
  expiresAt: number;
}

export interface MockServerOptions {
  products: Product[];
  latencyMs?: () => number;
  accessTokenTtlMs?: number;
  newToken: () => string;
  now?: () => number;
  storage?: MockServerStorage;
}

export interface MockServerStorage {
  load(): string | undefined;
  save(state: string): void;
}

interface State {
  sessions: [string, Session][];
  cart: [string, CartLine][];
  orders: [string, Order][];
}

type Handler = (request: HttpRequest, params: string[]) => HttpResponse | Promise<HttpResponse>;

const json = (status: number, body: unknown = null): HttpResponse => ({ status, body });

export class MockServer implements HttpTransport {
  private offline = false;

  private readonly sessions: Map<string, Session>;
  private readonly cart: Map<string, CartLine>;
  private readonly orders: Map<string, Order>;
  private readonly routes: [string, RegExp, Handler][];

  constructor(private readonly options: MockServerOptions) {
    const saved = options.storage?.load();
    const state: State = saved ? JSON.parse(saved) : { sessions: [], cart: [], orders: [] };
    this.sessions = new Map(state.sessions);
    this.cart = new Map(state.cart);
    this.orders = new Map(state.orders);
    this.routes = [
      ['POST', /^\/auth\/login$/, (req) => this.login(req)],
      ['POST', /^\/auth\/refresh$/, (req) => this.refresh(req)],
      ['GET', /^\/products$/, () => json(200, { items: this.options.products })],
      ['GET', /^\/products\/([^/]+)$/, (_, [id]) => this.product(id!)],
      ['GET', /^\/cart$/, () => json(200, { items: [...this.cart.values()] })],
      ['PUT', /^\/cart\/items\/([^/]+)$/, (req, [id]) => this.putCartLine(id!, req.body)],
      ['DELETE', /^\/cart\/items\/([^/]+)$/, (_, [id]) => this.deleteCartLine(id!)],
      ['GET', /^\/orders$/, () => json(200, { items: [...this.orders.values()].reverse() })],
      ['POST', /^\/orders$/, (req) => this.createOrder(req)],
    ];
  }

  setOffline(offline: boolean) {
    this.offline = offline;
  }

  async send(request: HttpRequest): Promise<HttpResponse> {
    await delay(this.options.latencyMs?.() ?? 0);
    if (this.offline)
      throw new ApiError('network', 'The Internet connection appears to be offline.');

    const path = decodeURIComponent(request.path.split('?')[0]!);
    for (const [method, pattern, handler] of this.routes) {
      const match = method === request.method ? pattern.exec(path) : null;
      if (!match) continue;
      const isPublic = path.startsWith('/auth/') || path.startsWith('/products');
      if (!isPublic && !this.authorized(request)) return json(401, { error: 'unauthorized' });
      const response = await handler(request, match.slice(1));
      if (request.method !== 'GET') this.persist();
      return response;
    }
    return json(404, { error: 'not_found' });
  }

  private persist() {
    const state: State = {
      sessions: [...this.sessions],
      cart: [...this.cart],
      orders: [...this.orders],
    };
    this.options.storage?.save(JSON.stringify(state));
  }

  private now() {
    return this.options.now?.() ?? Date.now();
  }

  private issueSession() {
    const accessToken = this.options.newToken();
    const refreshToken = this.options.newToken();
    const expiresAt = this.now() + (this.options.accessTokenTtlMs ?? 10 * 60_000);
    this.sessions.set(accessToken, { refreshToken, expiresAt });
    return json(200, { accessToken, refreshToken, expiresAt, user: DEMO_USER });
  }

  private authorized(request: HttpRequest) {
    const token = request.headers.Authorization?.replace(/^Bearer /, '');
    const session = token ? this.sessions.get(token) : undefined;
    return session !== undefined && session.expiresAt > this.now();
  }

  private login({ body }: HttpRequest) {
    const { email, password } = (body ?? {}) as { email?: string; password?: string };
    if (email?.toLowerCase() !== DEMO_USER.email || password !== DEMO_CREDENTIALS.password) {
      return json(401, { error: 'invalid_credentials' });
    }
    return this.issueSession();
  }

  private refresh({ body }: HttpRequest) {
    const { refreshToken } = (body ?? {}) as { refreshToken?: string };
    const entry = [...this.sessions].find(([, session]) => session.refreshToken === refreshToken);
    if (!entry) return json(401, { error: 'invalid_refresh_token' });
    this.sessions.delete(entry[0]);
    return this.issueSession();
  }

  private product(id: string) {
    const product = this.options.products.find((candidate) => candidate.id === id);
    return product ? json(200, product) : json(404, { error: 'not_found' });
  }

  private putCartLine(id: string, body: unknown) {
    const { productId, variantId, quantity } = body as {
      productId: string;
      variantId: string;
      quantity: number;
    };
    const product = this.options.products.find((candidate) => candidate.id === productId);
    const variant = product?.variants.find((candidate) => candidate.id === variantId);
    if (!product || !variant || quantity < 1) return json(422, { error: 'invalid_line' });
    this.cart.set(id, {
      id,
      productId,
      variantId,
      title: product.title,
      variantName: variant.name,
      image: variant.image,
      unitPriceMinor: product.priceMinor,
      currency: product.currency,
      quantity,
    });
    return json(204);
  }

  private deleteCartLine(id: string) {
    return this.cart.delete(id) ? json(204) : json(404, { error: 'not_found' });
  }

  private createOrder({ body, headers }: HttpRequest) {
    const order = body as Order;
    const key = headers['Idempotency-Key'];
    if (!key || key !== order.id) return json(400, { error: 'idempotency_key_required' });

    const existing = this.orders.get(order.id);
    if (existing) return json(200, existing);

    const placed: Order = { ...order, status: 'placed' };
    this.orders.set(order.id, placed);
    this.cart.clear();
    return json(201, placed);
  }
}

const delay = (ms: number) =>
  ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
