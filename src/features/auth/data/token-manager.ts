import { z } from 'zod';

import type { AuthHandler } from '@/core/api/api-client';
import { isApiError } from '@/core/api/errors';
import type { SecureStorage } from '@/core/storage/secure-storage';

export const TokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.number().int(),
});

export type Tokens = z.infer<typeof TokensSchema>;

const STORAGE_KEY = 'auth.tokens';
const EXPIRY_MARGIN_MS = 30_000;

interface Options {
  storage: SecureStorage;
  refreshTokens: (refreshToken: string) => Promise<Tokens>;
  onExpired: () => void;
  now?: () => number;
}

/** Concurrent 401s share one refresh; an offline refresh failure does not end the session. */
export class TokenManager implements AuthHandler {
  private cached: Tokens | null | undefined;
  private refreshing: Promise<string | null> | null = null;

  constructor(private readonly options: Options) {}

  async accessToken(): Promise<string | null> {
    const tokens = await this.load();
    if (!tokens) return null;
    const now = this.options.now?.() ?? Date.now();
    if (tokens.expiresAt - now < EXPIRY_MARGIN_MS) return this.refresh();
    return tokens.accessToken;
  }

  refresh(): Promise<string | null> {
    this.refreshing ??= this.renew().finally(() => {
      this.refreshing = null;
    });
    return this.refreshing;
  }

  sessionExpired() {
    this.options.onExpired();
  }

  async save(tokens: Tokens) {
    this.cached = tokens;
    await this.options.storage.set(STORAGE_KEY, JSON.stringify(tokens));
  }

  async clear() {
    this.cached = null;
    await this.options.storage.delete(STORAGE_KEY);
  }

  async hasSession() {
    return (await this.load()) !== null;
  }

  private async renew(): Promise<string | null> {
    const current = await this.load();
    if (!current) return null;
    try {
      const next = await this.options.refreshTokens(current.refreshToken);
      await this.save(next);
      return next.accessToken;
    } catch (error) {
      if (isApiError(error) && error.isRetryable) throw error;
      await this.clear();
      return null;
    }
  }

  private async load(): Promise<Tokens | null> {
    if (this.cached !== undefined) return this.cached;
    const raw = await this.options.storage.get(STORAGE_KEY);
    const parsed = raw ? TokensSchema.safeParse(safeJson(raw)) : null;
    this.cached = parsed?.success ? parsed.data : null;
    return this.cached;
  }
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
