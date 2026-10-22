export const MAX_LINE_QUANTITY = 10;
export const FREE_SHIPPING_THRESHOLD_MINOR = 7_500;
export const SHIPPING_FEE_MINOR = 490;

export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantName: string;
  image: string;
  unitPriceMinor: number;
  currency: string;
  quantity: number;
}

export type NewCartItem = Omit<CartLine, 'id' | 'quantity'>;

export interface CartTotals {
  itemCount: number;
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  currency: string | null;
}

export const lineIdFor = (productId: string, variantId: string) => `${productId}:${variantId}`;

export const clampQuantity = (quantity: number) =>
  Math.max(0, Math.min(MAX_LINE_QUANTITY, Math.trunc(quantity)));

export function addItem(lines: readonly CartLine[], item: NewCartItem, quantity = 1): CartLine[] {
  const id = lineIdFor(item.productId, item.variantId);
  const existing = lines.find((line) => line.id === id);
  if (!existing) {
    return [...lines, { ...item, id, quantity: clampQuantity(quantity) }];
  }
  return setQuantity(lines, id, existing.quantity + quantity);
}

export function setQuantity(
  lines: readonly CartLine[],
  lineId: string,
  quantity: number,
): CartLine[] {
  const next = clampQuantity(quantity);
  if (next === 0) return lines.filter((line) => line.id !== lineId);
  return lines.map((line) => (line.id === lineId ? { ...line, quantity: next } : line));
}

export function cartTotals(lines: readonly CartLine[]): CartTotals {
  const subtotalMinor = lines.reduce((sum, line) => sum + line.unitPriceMinor * line.quantity, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const shippingMinor =
    itemCount === 0 || subtotalMinor >= FREE_SHIPPING_THRESHOLD_MINOR ? 0 : SHIPPING_FEE_MINOR;
  return {
    itemCount,
    subtotalMinor,
    shippingMinor,
    totalMinor: subtotalMinor + shippingMinor,
    currency: lines[0]?.currency ?? null,
  };
}

export const amountToFreeShipping = (totals: CartTotals) =>
  Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - totals.subtotalMinor);
