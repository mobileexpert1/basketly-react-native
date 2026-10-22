import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type { schema } from './schema';

export type AppDatabase = BaseSQLiteDatabase<'sync', unknown, typeof schema>;
