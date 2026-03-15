import type { SupabaseClient } from '@supabase/supabase-js';
import { and, desc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../client';
import { categories } from '../schema';
import { deleteOne, insertOne, selectByUserId, updateOne } from './supabase-helpers';

const TABLE = 'categories';

// ─── Drizzle (direct Postgres) ─────────────────────────────────────────────

export const listCategoriesByUser = (db: DatabaseClient, userId: string) =>
  db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: [desc(categories.updatedAt)],
  });

export const createCategory = (
  db: DatabaseClient,
  values: Omit<typeof categories.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) => db.insert(categories).values(values).returning();

export const updateCategory = (
  db: DatabaseClient,
  userId: string,
  id: string,
  values: Partial<Omit<typeof categories.$inferInsert, 'id' | 'userId' | 'createdAt'>>
) =>
  db
    .update(categories)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(categories.userId, userId), eq(categories.id, id)))
    .returning();

export const deleteCategory = (db: DatabaseClient, userId: string, id: string) =>
  db
    .delete(categories)
    .where(and(eq(categories.userId, userId), eq(categories.id, id)))
    .returning();

// ─── Supabase ─────────────────────────────────────────────────────────────

export async function listCategoriesByUserSupabase<T = (typeof categories.$inferSelect)[]>(
  supabase: SupabaseClient,
  userId: string
): Promise<T> {
  return selectByUserId<T>(supabase, TABLE, userId, { column: 'updated_at', ascending: false }) as Promise<T>;
}

export async function createCategorySupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await insertOne(supabase, TABLE, userId, data);
}

export async function updateCategorySupabase(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateOne(supabase, TABLE, userId, id, data);
}

export async function deleteCategorySupabase(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  await deleteOne(supabase, TABLE, userId, id);
}
