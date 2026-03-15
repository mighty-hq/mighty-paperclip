import { boolean as pgBoolean, index, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';

export const snippets = pgTable(
  'snippets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    categoryId: uuid('category_id'),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    content: text('content').notNull().default(''),
    type: text('type').notNull().default('Other'),
    language: text('language').notNull().default('text'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isFavorite: pgBoolean('is_favorite').notNull().default(false),
    usageCount: integer('usage_count').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('snippets_user_id_idx').on(table.userId),
    categoryIdx: index('snippets_category_id_idx').on(table.categoryId),
  })
);

export type Snippet = typeof snippets.$inferSelect;
export type NewSnippet = typeof snippets.$inferInsert;
