import { products } from '../../../../test/fixtures';
import { defaultVariant, filterProducts, isSoldOut } from './product';

describe('catalog rules', () => {
  it('filters by category and by every search term, ignoring case and accents', () => {
    expect(filterProducts(products, { query: '', category: 'travel' }).map((p) => p.id)).toEqual([
      'weekender-bag',
      'insulated-bottle',
    ]);
    expect(filterProducts(products, { query: 'STONEWARE mug', category: null })).toHaveLength(1);
    expect(filterProducts(products, { query: 'gòosenéck', category: null })[0]?.id).toBe(
      'pour-over-kettle',
    );
    expect(filterProducts(products, { query: 'mug', category: 'audio' })).toEqual([]);
  });

  it('picks the first variant in stock as the default', () => {
    const mug = products.find((p) => p.id === 'stoneware-mug')!;
    const soldOutFirst = { ...mug, variants: [...mug.variants].reverse() };
    expect(defaultVariant(soldOutFirst)?.id).toBe('sage');
    expect(isSoldOut(mug)).toBe(false);
  });
});
