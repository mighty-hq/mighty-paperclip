import type { SupabaseClient } from '@supabase/supabase-js';
import { and, asc, desc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../client';
import { quickLinks } from '../schema';
import { deleteOne, insertOne, selectByUserId, updateOne } from './supabase-helpers';

const TABLE = 'quick_links';

// ─── Drizzle (direct Postgres) ─────────────────────────────────────────────

export const listQuickLinksByUser = (db: DatabaseClient, userId: string) =>
  db.query.quickLinks.findMany({
    where: eq(quickLinks.userId, userId),
    orderBy: [asc(quickLinks.sortOrder), desc(quickLinks.updatedAt)],
  });

export const createQuickLink = (
  db: DatabaseClient,
  values: Omit<typeof quickLinks.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) => db.insert(quickLinks).values(values).returning();

export const updateQuickLink = (
  db: DatabaseClient,
  userId: string,
  id: string,
  values: Partial<Omit<typeof quickLinks.$inferInsert, 'id' | 'userId' | 'createdAt'>>
) =>
  db
    .update(quickLinks)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(quickLinks.userId, userId), eq(quickLinks.id, id)))
    .returning();

export const deleteQuickLink = (db: DatabaseClient, userId: string, id: string) =>
  db
    .delete(quickLinks)
    .where(and(eq(quickLinks.userId, userId), eq(quickLinks.id, id)))
    .returning();

// ─── Supabase ─────────────────────────────────────────────────────────────

export async function listQuickLinksByUserSupabase<T = (typeof quickLinks.$inferSelect)[]>(
  supabase: SupabaseClient,
  userId: string
): Promise<T> {
  const rows = await selectByUserId<unknown>(supabase, TABLE, userId);
  const withOrder = (rows as { sortOrder?: number; updatedAt?: string }[]).sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')
  );
  return withOrder as T;
}

export async function createQuickLinkSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await insertOne(supabase, TABLE, userId, data);
}

export async function updateQuickLinkSupabase(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateOne(supabase, TABLE, userId, id, data);
}

export async function deleteQuickLinkSupabase(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  await deleteOne(supabase, TABLE, userId, id);
}
