import { boolean as pgBoolean, index, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';

export const prompts = pgTable(
  'prompts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    categoryId: uuid('category_id'),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull().default(''),
    description: text('description').notNull().default(''),
    content: text('content').notNull().default(''),
    icon: text('icon').notNull().default('Sparkles'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isFavorite: pgBoolean('is_favorite').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('prompts_user_id_idx').on(table.userId),
    categoryIdx: index('prompts_category_id_idx').on(table.categoryId),
  })
);

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
