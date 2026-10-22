import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';

import type { AppDatabase } from './database';
import migrations from './migrations/migrations';
import { schema } from './schema';

const DATABASE_NAME = 'basketly.db';

export async function openDatabase(encryptionKey: string): Promise<AppDatabase> {
  if (!/^[0-9a-f]{64}$/.test(encryptionKey)) throw new Error('Invalid database key');

  const sqlite = openDatabaseSync(DATABASE_NAME);
  sqlite.execSync(`PRAGMA key = "x'${encryptionKey}'"`);
  sqlite.execSync('PRAGMA journal_mode = WAL');

  const db = drizzle(sqlite, { schema });
  await migrate(db, migrations);
  return db;
}
