import { z } from 'zod';

import type { ApiClient } from '@/core/api/api-client';
import type { SecureStorage } from '@/core/storage/secure-storage';

import type { AuthRepository, Credentials, User } from '../domain/session';
import { TokensSchema, type TokenManager, type Tokens } from './token-manager';

const UserSchema = z.object({ id: z.string(), name: z.string(), email: z.string() });
const SessionSchema = TokensSchema.extend({ user: UserSchema });

const USER_KEY = 'auth.user';

export class HttpAuthRepository implements AuthRepository {
  constructor(
    private readonly publicApi: ApiClient,
    private readonly tokens: TokenManager,
    private readonly storage: SecureStorage,
  ) {}

  async signIn(credentials: Credentials): Promise<User> {
    const { user, ...tokens } = await this.publicApi.request('/auth/login', SessionSchema, {
      method: 'POST',
      body: credentials,
    });
    await this.tokens.save(tokens);
    await this.storage.set(USER_KEY, JSON.stringify(user));
    return user;
  }

  async restore(): Promise<User | null> {
    if (!(await this.tokens.hasSession())) return null;
    const raw = await this.storage.get(USER_KEY);
    const parsed = raw ? UserSchema.safeParse(JSON.parse(raw)) : null;
    return parsed?.success ? parsed.data : null;
  }

  async signOut() {
    await this.tokens.clear();
    await this.storage.delete(USER_KEY);
  }
}

export async function refreshTokens(publicApi: ApiClient, refreshToken: string): Promise<Tokens> {
  const { user: _user, ...tokens } = await publicApi.request('/auth/refresh', SessionSchema, {
    method: 'POST',
    body: { refreshToken },
  });
  return tokens;
}
