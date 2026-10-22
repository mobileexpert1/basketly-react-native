import type { Product } from '@/features/catalog/domain/product';

type Fixture = Omit<Product, 'variants'> & {
  variants: { id: string; name: string; swatch: string; stock: number }[];
};

export const catalogFixtures: Fixture[] = [
  {
    id: 'stoneware-mug',
    title: 'Stoneware Mug',
    subtitle: 'Hand-glazed, 350 ml',
    description:
      'Thrown from speckled stoneware and finished with a satin glaze that feels warm in the hand. Dishwasher and microwave safe.',
    category: 'kitchen',
    priceMinor: 1800,
    currency: 'EUR',
    rating: 4.8,
    variants: [
      { id: 'sand', name: 'Sand', swatch: '#D9C3A0', stock: 24 },
      { id: 'sage', name: 'Sage', swatch: '#9DB29A', stock: 12 },
      { id: 'charcoal', name: 'Charcoal', swatch: '#3D3F3E', stock: 0 },
    ],
  },
  {
    id: 'pour-over-kettle',
    title: 'Pour-over Kettle',
    subtitle: 'Gooseneck, 0.9 l',
    description:
      'A precise gooseneck spout and a balanced handle for slow, even pours. Works on gas, electric and induction hobs.',
    category: 'kitchen',
    priceMinor: 6400,
    currency: 'EUR',
    rating: 4.6,
    variants: [
      { id: 'matte-black', name: 'Matte black', swatch: '#2A2A2C', stock: 8 },
      { id: 'steel', name: 'Brushed steel', swatch: '#B8BCC0', stock: 5 },
    ],
  },
  {
    id: 'linen-throw',
    title: 'Linen Throw',
    subtitle: 'Stonewashed European flax',
    description:
      'Soft from the first use, breathable all year round and only softer with every wash. 130 × 180 cm.',
    category: 'home',
    priceMinor: 8900,
    currency: 'EUR',
    rating: 4.9,
    variants: [
      { id: 'oat', name: 'Oat', swatch: '#D8CCB6', stock: 10 },
      { id: 'clay', name: 'Clay', swatch: '#B9765A', stock: 6 },
      { id: 'ink', name: 'Ink', swatch: '#2F3A4F', stock: 3 },
    ],
  },
  {
    id: 'arc-desk-lamp',
    title: 'Arc Desk Lamp',
    subtitle: 'Dimmable LED, 2700 K',
    description:
      'A steel arc with a weighted base and a warm, flicker-free LED. The touch dimmer remembers your last setting.',
    category: 'home',
    priceMinor: 12000,
    currency: 'EUR',
    rating: 4.7,
    variants: [
      { id: 'ivory', name: 'Ivory', swatch: '#EDE6D6', stock: 7 },
      { id: 'forest', name: 'Forest', swatch: '#2E4A3C', stock: 4 },
    ],
  },
  {
    id: 'terracotta-planter',
    title: 'Terracotta Planter',
    subtitle: 'With drainage saucer, Ø 18 cm',
    description:
      'Unglazed terracotta that lets roots breathe, paired with a saucer that keeps shelves dry.',
    category: 'home',
    priceMinor: 3600,
    currency: 'EUR',
    rating: 4.5,
    variants: [
      { id: 'terracotta', name: 'Terracotta', swatch: '#C0673F', stock: 15 },
      { id: 'chalk', name: 'Chalk', swatch: '#E9E4DA', stock: 9 },
    ],
  },
  {
    id: 'weekender-bag',
    title: 'Weekender Bag',
    subtitle: 'Waxed canvas, 38 l',
    description:
      'Water-resistant waxed canvas with leather handles, a padded laptop sleeve and a shoe compartment.',
    category: 'travel',
    priceMinor: 14500,
    currency: 'EUR',
    rating: 4.8,
    variants: [
      { id: 'olive', name: 'Olive', swatch: '#6B6B3E', stock: 5 },
      { id: 'navy', name: 'Navy', swatch: '#26334D', stock: 2 },
    ],
  },
  {
    id: 'insulated-bottle',
    title: 'Insulated Bottle',
    subtitle: 'Keeps cold 24 h, 750 ml',
    description:
      'Double-wall stainless steel with a leak-proof cap. Cold for a day, hot for twelve hours.',
    category: 'travel',
    priceMinor: 2900,
    currency: 'EUR',
    rating: 4.6,
    variants: [
      { id: 'mist', name: 'Mist', swatch: '#B7C9CF', stock: 30 },
      { id: 'coral', name: 'Coral', swatch: '#E07A5F', stock: 18 },
      { id: 'ink', name: 'Ink', swatch: '#283044', stock: 22 },
    ],
  },
  {
    id: 'studio-headphones',
    title: 'Studio Headphones',
    subtitle: 'Wireless, noise cancelling',
    description:
      'Balanced, detailed sound with adaptive noise cancelling and 40 hours of battery. Folds flat for travel.',
    category: 'audio',
    priceMinor: 19900,
    currency: 'EUR',
    rating: 4.7,
    variants: [
      { id: 'graphite', name: 'Graphite', swatch: '#3A3B3F', stock: 6 },
      { id: 'bone', name: 'Bone', swatch: '#E6DFD2', stock: 4 },
    ],
  },
];
