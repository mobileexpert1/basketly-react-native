import path from 'node:path';

import { drizzle } from 'drizzle-orm/sql-js';
import { migrate } from 'drizzle-orm/sql-js/migrator';
import initSqlJs from 'sql.js';

import type { AppDatabase } from '@/core/db/database';
import { schema } from '@/core/db/schema';

export async function createTestDatabase(): Promise<AppDatabase> {
  const SQL = await initSqlJs();
  const db = drizzle(new SQL.Database(), { schema });
  migrate(db, { migrationsFolder: path.join(__dirname, '../src/core/db/migrations') });
  return db;
}
