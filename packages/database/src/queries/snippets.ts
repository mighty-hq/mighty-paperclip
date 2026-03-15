import type { SupabaseClient } from '@supabase/supabase-js';
import { and, desc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../client';
import { snippets } from '../schema';
import { deleteOne, insertOne, selectByUserId, updateOne } from './supabase-helpers';

const TABLE = 'snippets';

// ─── Drizzle (direct Postgres) ─────────────────────────────────────────────

export const listSnippetsByUser = (db: DatabaseClient, userId: string) =>
  db.query.snippets.findMany({
    where: eq(snippets.userId, userId),
    orderBy: [desc(snippets.updatedAt)],
  });

export const createSnippet = (
  db: DatabaseClient,
  values: Omit<typeof snippets.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) => db.insert(snippets).values(values).returning();

export const updateSnippet = (
  db: DatabaseClient,
  userId: string,
  id: string,
  values: Partial<Omit<typeof snippets.$inferInsert, 'id' | 'userId' | 'createdAt'>>
) =>
  db
    .update(snippets)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(snippets.userId, userId), eq(snippets.id, id)))
    .returning();

export const deleteSnippet = (db: DatabaseClient, userId: string, id: string) =>
  db
    .delete(snippets)
    .where(and(eq(snippets.userId, userId), eq(snippets.id, id)))
    .returning();

// ─── Supabase ─────────────────────────────────────────────────────────────

export async function listSnippetsByUserSupabase<T = (typeof snippets.$inferSelect)[]>(
  supabase: SupabaseClient,
  userId: string
): Promise<T> {
  return selectByUserId<T>(supabase, TABLE, userId, { column: 'updated_at', ascending: false }) as Promise<T>;
}

export async function createSnippetSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await insertOne(supabase, TABLE, userId, data);
}

export async function updateSnippetSupabase(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateOne(supabase, TABLE, userId, id, data);
}

export async function deleteSnippetSupabase(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  await deleteOne(supabase, TABLE, userId, id);
}
