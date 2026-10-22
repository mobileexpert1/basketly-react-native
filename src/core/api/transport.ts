import { ApiError } from './errors';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface HttpResponse {
  status: number;
  body: unknown;
}

export interface HttpTransport {
  send(request: HttpRequest, signal: AbortSignal): Promise<HttpResponse>;
}

export class FetchTransport implements HttpTransport {
  constructor(private readonly baseUrl: string) {}

  async send(request: HttpRequest, signal: AbortSignal): Promise<HttpResponse> {
    let response: Response;
    try {
      response = await fetch(new URL(request.path, this.baseUrl).toString(), {
        method: request.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...request.headers,
        },
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw new ApiError('timeout', 'Request timed out');
      throw new ApiError('network', error instanceof Error ? error.message : 'Network error');
    }
    const text = await response.text();
    return { status: response.status, body: text ? safeJson(text) : null };
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
