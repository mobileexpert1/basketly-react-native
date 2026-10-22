import { lamp, mug } from '../../../../test/fixtures';
import {
  addItem,
  amountToFreeShipping,
  cartTotals,
  lineIdFor,
  MAX_LINE_QUANTITY,
  SHIPPING_FEE_MINOR,
  setQuantity,
} from './cart';

describe('cart rules', () => {
  it('merges the same variant into one line', () => {
    const lines = addItem(addItem([], mug), mug, 2);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ id: lineIdFor('stoneware-mug', 'sand'), quantity: 3 });
  });

  it('caps a line at the maximum quantity', () => {
    const lines = addItem([], mug, MAX_LINE_QUANTITY + 5);
    expect(lines[0]?.quantity).toBe(MAX_LINE_QUANTITY);
  });

  it('removes a line when its quantity reaches zero', () => {
    const lines = addItem([], mug);
    expect(setQuantity(lines, lines[0]!.id, 0)).toEqual([]);
  });

  it('charges shipping below the threshold and waives it above', () => {
    const small = cartTotals(addItem([], mug, 2));
    expect(small).toMatchObject({ subtotalMinor: 3600, shippingMinor: SHIPPING_FEE_MINOR });
    expect(amountToFreeShipping(small)).toBe(3900);

    const large = cartTotals(addItem([], lamp));
    expect(large).toMatchObject({ subtotalMinor: 12000, shippingMinor: 0, totalMinor: 12000 });
  });

  it('reports an empty cart without shipping or currency', () => {
    expect(cartTotals([])).toEqual({
      itemCount: 0,
      subtotalMinor: 0,
      shippingMinor: 0,
      totalMinor: 0,
      currency: null,
    });
  });
});
