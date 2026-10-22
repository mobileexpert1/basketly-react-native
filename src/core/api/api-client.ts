import type { z } from 'zod';

import { ApiError, errorKindForStatus } from './errors';
import type { HttpMethod, HttpTransport } from './transport';

export interface AuthHandler {
  accessToken(): Promise<string | null>;
  refresh(): Promise<string | null>;
  sessionExpired(): void;
}

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiClient {
  constructor(
    private readonly transport: HttpTransport,
    private readonly auth?: AuthHandler,
    private readonly timeoutMs = 15_000,
  ) {}

  async request<T>(path: string, schema: z.ZodType<T>, options: RequestOptions = {}): Promise<T> {
    let response = await this.send(path, options, await this.auth?.accessToken());

    if (response.status === 401 && this.auth) {
      const token = await this.auth.refresh();
      if (!token) {
        this.auth.sessionExpired();
        throw new ApiError('unauthorized', 'Session expired', 401);
      }
      response = await this.send(path, options, token);
    }

    if (response.status < 200 || response.status >= 300) {
      throw new ApiError(
        errorKindForStatus(response.status),
        `${options.method ?? 'GET'} ${path} failed`,
        response.status,
      );
    }

    const parsed = schema.safeParse(response.body);
    if (!parsed.success) {
      throw new ApiError('invalid-response', `Unexpected response for ${path}`, response.status);
    }
    return parsed.data;
  }

  private async send(path: string, options: RequestOptions, token: string | null | undefined) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await this.transport.send(
        {
          method: options.method ?? 'GET',
          path,
          body: options.body,
          headers: { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        },
        controller.signal,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
