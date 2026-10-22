export const CATEGORIES = ['kitchen', 'home', 'travel', 'audio'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Variant {
  id: string;
  name: string;
  swatch: string;
  image: string;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  priceMinor: number;
  currency: string;
  rating: number;
  variants: Variant[];
}

export interface CatalogFilter {
  query: string;
  category: Category | null;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function filterProducts(products: readonly Product[], filter: CatalogFilter): Product[] {
  const terms = normalize(filter.query).split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    if (filter.category && product.category !== filter.category) return false;
    const haystack = normalize(`${product.title} ${product.subtitle}`);
    return terms.every((term) => haystack.includes(term));
  });
}

export const isInStock = (variant: Variant) => variant.stock > 0;

export function defaultVariant(product: Product): Variant | undefined {
  return product.variants.find(isInStock) ?? product.variants[0];
}

export const isSoldOut = (product: Product) => !product.variants.some(isInStock);
