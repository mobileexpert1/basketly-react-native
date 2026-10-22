import { z } from 'zod';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '10.0.2.2']);

export const BackendSchema = z.enum(['mock', 'rest']);
export type Backend = z.infer<typeof BackendSchema>;

const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

function createEnvSchema(allowLocalHttp: boolean) {
  const apiUrl = z.url().refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' || (allowLocalHttp && LOCAL_HOSTS.has(url.hostname));
  }, 'API URL must use HTTPS');

  return z
    .object({
      backend: z.preprocess(blankToUndefined, BackendSchema.default('mock')),
      apiUrl: z.preprocess(blankToUndefined, apiUrl.optional()),
      paymentProvider: z.preprocess(blankToUndefined, z.string().default('mock')),
    })
    .refine((env) => env.backend === 'mock' || env.apiUrl !== undefined, {
      message: 'EXPO_PUBLIC_API_URL is required for the REST backend',
      path: ['apiUrl'],
    });
}

export type Env = z.infer<ReturnType<typeof createEnvSchema>>;

export function parseEnv(raw: Record<string, string | undefined>, allowLocalHttp: boolean): Env {
  const result = createEnvSchema(allowLocalHttp).safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid configuration: ${z.prettifyError(result.error)}`);
  }
  return result.data;
}

// EXPO_PUBLIC_* variables are inlined at build time, so they must be read with static property access.
export const env = parseEnv(
  {
    backend: process.env.EXPO_PUBLIC_BACKEND,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    paymentProvider: process.env.EXPO_PUBLIC_PAYMENT_PROVIDER,
  },
  __DEV__,
);
