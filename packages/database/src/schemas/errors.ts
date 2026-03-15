import { boolean as pgBoolean, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createdAt } from './helpers';

export const errors = pgTable(
  'errors',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id'),
    code: text('code').notNull(),
    message: text('message').notNull(),
    context: text('context').notNull().default(''),
    stackTrace: text('stack_trace').notNull().default(''),
    severity: text('severity').notNull().default('error'),
    source: text('source').notNull().default('client'),
    metadata: jsonb('metadata').default({}),
    resolved: pgBoolean('resolved').notNull().default(false),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
    createdAt,
  },
  (table) => ({
    userIdx: index('errors_user_id_idx').on(table.userId),
    severityIdx: index('errors_severity_idx').on(table.severity),
    timestampIdx: index('errors_timestamp_idx').on(table.timestamp),
  })
);

export type AppError = typeof errors.$inferSelect;
export type NewAppError = typeof errors.$inferInsert;
