import type { SupabaseClient } from '@supabase/supabase-js';
import { and, desc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../client';
import { clipboardItems } from '../schema';
import { deleteOne, insertOne, selectByUserId } from './supabase-helpers';

const TABLE = 'clipboard_items';

// ─── Drizzle (direct Postgres) ─────────────────────────────────────────────

export const listClipboardByUser = (db: DatabaseClient, userId: string) =>
  db.query.clipboardItems.findMany({
    where: eq(clipboardItems.userId, userId),
    orderBy: [desc(clipboardItems.timestamp)],
  });

export const createClipboardItem = (
  db: DatabaseClient,
  values: Omit<typeof clipboardItems.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) => db.insert(clipboardItems).values(values).returning();

export const deleteClipboardItem = (db: DatabaseClient, userId: string, id: string) =>
  db
    .delete(clipboardItems)
    .where(and(eq(clipboardItems.userId, userId), eq(clipboardItems.id, id)))
    .returning();

// ─── Supabase ─────────────────────────────────────────────────────────────

export async function listClipboardByUserSupabase<T = (typeof clipboardItems.$inferSelect)[]>(
  supabase: SupabaseClient,
  userId: string
): Promise<T> {
  return selectByUserId<T>(supabase, TABLE, userId, { column: 'timestamp', ascending: false }) as Promise<T>;
}

export async function addClipboardItemSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await insertOne(supabase, TABLE, userId, data);
}

export async function deleteClipboardItemSupabase(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  await deleteOne(supabase, TABLE, userId, id);
}

/** Delete all clipboard items for a user (mirrors service clearClipboard). */
export async function clearClipboardSupabase(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('user_id', userId);
  if (error) throw error;
}
