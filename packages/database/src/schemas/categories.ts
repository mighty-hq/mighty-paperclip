import { index, integer, jsonb, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    icon: text('icon').notNull().default('FolderOpen'),
    color: text('color').notNull().default('#3b82f6'),
    type: text('type').notNull().default('both'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('categories_user_id_idx').on(table.userId),
    userTypeIdx: index('categories_user_type_idx').on(table.userId, table.type),
    uniqueUserNameTypeIdx: uniqueIndex('categories_user_name_type_uidx').on(table.userId, table.name, table.type),
  })
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
