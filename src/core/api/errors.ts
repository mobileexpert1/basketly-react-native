export type ApiErrorKind =
  'network' | 'timeout' | 'unauthorized' | 'rejected' | 'server' | 'invalid-response';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isRetryable() {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function errorKindForStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status >= 500) return 'server';
  return 'rejected';
}
