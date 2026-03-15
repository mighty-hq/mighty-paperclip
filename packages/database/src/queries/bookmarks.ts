import type { SupabaseClient } from '@supabase/supabase-js';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import type { DatabaseClient } from '../client';
import { bookmarkFolders, bookmarks } from '../schema';
import { deleteOne, insertOne, selectByUserId, updateOne } from './supabase-helpers';

const BOOKMARKS_TABLE = 'bookmarks';
const FOLDERS_TABLE = 'bookmark_folders';

// ─── Drizzle (direct Postgres) ─────────────────────────────────────────────

export const listBookmarksByUser = (db: DatabaseClient, userId: string) =>
  db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: [desc(bookmarks.updatedAt)],
  });

export const createBookmark = (
  db: DatabaseClient,
  values: Omit<typeof bookmarks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) => db.insert(bookmarks).values(values).returning();

export const updateBookmark = (
  db: DatabaseClient,
  userId: string,
  id: string,
  values: Partial<Omit<typeof bookmarks.$inferInsert, 'id' | 'userId' | 'createdAt'>>
) =>
  db
    .update(bookmarks)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.id, id)))
    .returning();

export const deleteBookmark = (db: DatabaseClient, userId: string, id: string) =>
  db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.id, id)))
    .returning();

export const listBookmarkFoldersByUser = (db: DatabaseClient, userId: string) =>
  db.query.bookmarkFolders.findMany({
    where: eq(bookmarkFolders.userId, userId),
    orderBy: [asc(bookmarkFolders.sortOrder), asc(bookmarkFolders.name)],
  });

export const createBookmarkFolder = (
  db: DatabaseClient,
  values: Omit<typeof bookmarkFolders.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) => db.insert(bookmarkFolders).values(values).returning();

export const updateBookmarkFolder = (
  db: DatabaseClient,
  userId: string,
  id: string,
  values: Partial<Omit<typeof bookmarkFolders.$inferInsert, 'id' | 'userId' | 'createdAt'>>
) =>
  db
    .update(bookmarkFolders)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(bookmarkFolders.userId, userId), eq(bookmarkFolders.id, id)))
    .returning();

export const deleteBookmarkFolderWithItems = async (db: DatabaseClient, userId: string, folderId: string) => {
  const folders = await listBookmarkFoldersByUser(db, userId);
  const descendants = new Set<string>([folderId]);

  let changed = true;
  while (changed) {
    changed = false;
    folders.forEach((folder: typeof bookmarkFolders.$inferSelect) => {
      if (folder.parentId && descendants.has(folder.parentId) && !descendants.has(folder.id)) {
        descendants.add(folder.id);
        changed = true;
      }
    });
  }

  const folderIds = Array.from(descendants);
  if (folderIds.length > 0) {
    await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), inArray(bookmarks.folderId, folderIds)));
    await db
      .delete(bookmarkFolders)
      .where(and(eq(bookmarkFolders.userId, userId), inArray(bookmarkFolders.id, folderIds)));
  }

  return folderIds;
};

// ─── Supabase ─────────────────────────────────────────────────────────────

export async function listBookmarksByUserSupabase<T = (typeof bookmarks.$inferSelect)[]>(
  supabase: SupabaseClient,
  userId: string
): Promise<T> {
  return selectByUserId<T>(supabase, BOOKMARKS_TABLE, userId, { column: 'updated_at', ascending: false }) as Promise<T>;
}

export async function createBookmarkSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await insertOne(supabase, BOOKMARKS_TABLE, userId, data);
}

export async function updateBookmarkSupabase(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateOne(supabase, BOOKMARKS_TABLE, userId, id, data);
}

export async function deleteBookmarkSupabase(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  await deleteOne(supabase, BOOKMARKS_TABLE, userId, id);
}

export async function listBookmarkFoldersByUserSupabase<T = (typeof bookmarkFolders.$inferSelect)[]>(
  supabase: SupabaseClient,
  userId: string
): Promise<T> {
  return selectByUserId<T>(supabase, FOLDERS_TABLE, userId, { column: 'sort_order', ascending: true }) as Promise<T>;
}

export async function createBookmarkFolderSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await insertOne(supabase, FOLDERS_TABLE, userId, data);
}

export async function updateBookmarkFolderSupabase(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateOne(supabase, FOLDERS_TABLE, userId, id, data);
}

export async function deleteBookmarkFolderSupabase(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<void> {
  await deleteOne(supabase, FOLDERS_TABLE, userId, id);
}
