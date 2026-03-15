import { boolean as pgBoolean, index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';

export const quickLinks = pgTable(
  'quick_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    title: text('title').notNull(),
    url: text('url').notNull(),
    icon: text('icon').notNull().default('Link'),
    isPinned: pgBoolean('is_pinned').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('quick_links_user_id_idx').on(table.userId),
  })
);

export type QuickLink = typeof quickLinks.$inferSelect;
export type NewQuickLink = typeof quickLinks.$inferInsert;
