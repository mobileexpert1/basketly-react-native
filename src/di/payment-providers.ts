import type { ApiClient } from '@/core/api/api-client';
import { MockPaymentProvider } from '@/features/payments/data/mock-payment-provider';
import type { PaymentProvider } from '@/features/payments/domain/payment-provider';

type PaymentProviderFactory = (api: ApiClient) => PaymentProvider;

const registry: Record<string, PaymentProviderFactory> = {
  mock: () => new MockPaymentProvider(),
};

export function createPaymentProvider(id: string, api: ApiClient): PaymentProvider {
  const factory = registry[id];
  if (!factory) throw new Error(`Unknown payment provider "${id}"`);
  return factory(api);
}
