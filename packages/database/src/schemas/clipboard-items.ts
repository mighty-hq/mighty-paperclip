import { boolean as pgBoolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';

export const clipboardItems = pgTable(
  'clipboard_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    content: text('content').notNull(),
    type: text('type').notNull().default('text'),
    source: text('source').notNull().default('app'),
    isPinned: pgBoolean('is_pinned').notNull().default(false),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('clipboard_items_user_id_idx').on(table.userId),
    timestampIdx: index('clipboard_items_timestamp_idx').on(table.timestamp),
  })
);

export type ClipboardItem = typeof clipboardItems.$inferSelect;
export type NewClipboardItem = typeof clipboardItems.$inferInsert;
