import type { Config } from 'drizzle-kit';

const databaseUrl =

  process.env.POSTGRES_URL ||
  'postgresql://postgres:postgres@localhost:5432/postgres';

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
