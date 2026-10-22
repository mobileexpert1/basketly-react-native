export interface PaymentRequest {
  orderId: string;
  amountMinor: number;
  currency: string;
  email: string;
}

export type PaymentOutcome =
  | { status: 'succeeded'; reference: string }
  | { status: 'canceled' }
  | { status: 'failed'; message: string };

export interface PaymentMethod {
  name: string;
  detail?: string;
  testMode: boolean;
}

export interface PaymentProvider {
  readonly method: PaymentMethod;
  pay(request: PaymentRequest): Promise<PaymentOutcome>;
}
