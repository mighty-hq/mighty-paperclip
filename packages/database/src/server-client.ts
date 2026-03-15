/**
 * Server-only Drizzle Postgres client. Do not import from the app/client bundle.
 * Use for migrations, scripts, and server-side direct DB access.
 * Import via: import { createDatabaseClient } from '@mighty/database/server'
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const getConnectionString = () => process.env.POSTGRES_URL || process.env.POSTGRES_URL || '';

export const createDatabaseClient = () => {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('Missing POSTGRES_URL for database client.');
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });
  return { db, sql };
};

export type DatabaseClient = ReturnType<typeof createDatabaseClient>['db'];
