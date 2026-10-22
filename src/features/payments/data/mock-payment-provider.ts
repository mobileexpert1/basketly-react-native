import type {
  PaymentMethod,
  PaymentOutcome,
  PaymentProvider,
  PaymentRequest,
} from '../domain/payment-provider';

export class MockPaymentProvider implements PaymentProvider {
  readonly method: PaymentMethod = { name: 'Visa', detail: '•••• 4242', testMode: true };

  constructor(private readonly delayMs = 900) {}

  async pay(request: PaymentRequest): Promise<PaymentOutcome> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    return { status: 'succeeded', reference: `mock_${request.orderId.slice(0, 8)}` };
  }
}
