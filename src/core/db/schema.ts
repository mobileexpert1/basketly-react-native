import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const cartItems = sqliteTable('cart_items', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  variantId: text('variant_id').notNull(),
  title: text('title').notNull(),
  variantName: text('variant_name').notNull(),
  image: text('image').notNull(),
  unitPriceMinor: integer('unit_price_minor').notNull(),
  currency: text('currency').notNull(),
  quantity: integer('quantity').notNull(),
  addedAt: integer('added_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  status: text('status').notNull(),
  createdAt: integer('created_at').notNull(),
  totalMinor: integer('total_minor').notNull(),
  currency: text('currency').notNull(),
  details: text('details', { mode: 'json' }).notNull(),
  synced: integer('synced', { mode: 'boolean' }).notNull().default(false),
});

export const outbox = sqliteTable('outbox', {
  entityKey: text('entity_key').primaryKey(),
  type: text('type').notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
  version: integer('version').notNull().default(1),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  createdAt: integer('created_at').notNull(),
});

export const schema = { cartItems, orders, outbox };
