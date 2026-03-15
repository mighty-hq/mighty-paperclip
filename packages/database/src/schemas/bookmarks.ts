import { boolean as pgBoolean, index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';

export const bookmarks = pgTable(
  'bookmarks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    folderId: uuid('folder_id').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    url: text('url').notNull(),
    icon: text('icon').notNull().default('Globe'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isFavorite: pgBoolean('is_favorite').notNull().default(false),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('bookmarks_user_id_idx').on(table.userId),
    folderIdx: index('bookmarks_folder_id_idx').on(table.folderId),
  })
);

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
