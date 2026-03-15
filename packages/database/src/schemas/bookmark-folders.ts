import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';

export const bookmarkFolders = pgTable(
  'bookmark_folders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    icon: text('icon').notNull().default('Folder'),
    parentId: uuid('parent_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('bookmark_folders_user_id_idx').on(table.userId),
    parentIdx: index('bookmark_folders_parent_id_idx').on(table.parentId),
  })
);

export type BookmarkFolder = typeof bookmarkFolders.$inferSelect;
export type NewBookmarkFolder = typeof bookmarkFolders.$inferInsert;
