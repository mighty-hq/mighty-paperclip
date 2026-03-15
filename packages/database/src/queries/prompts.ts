import type { SupabaseClient } from '@supabase/supabase-js';
import { and, desc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../client';
import { prompts } from '../schema';
import { deleteOne, insertOne, selectByUserId, updateOne } from './supabase-helpers';

const TABLE = 'prompts';

// ─── Drizzle (direct Postgres) ─────────────────────────────────────────────

export const listPromptsByUser = (db: DatabaseClient, userId: string) =>
  db.query.prompts.findMany({
    where: eq(prompts.userId, userId),
    orderBy: [desc(prompts.updatedAt)],
  });

export const createPrompt = (
  db: DatabaseClient,
  values: Omit<typeof prompts.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) => db.insert(prompts).values(values).returning();

export const updatePrompt = (
  db: DatabaseClient,
  userId: string,
  id: string,
  values: Partial<Omit<typeof prompts.$inferInsert, 'id' | 'userId' | 'createdAt'>>
) =>
  db
    .update(prompts)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(prompts.userId, userId), eq(prompts.id, id)))
    .returning();

export const deletePrompt = (db: DatabaseClient, userId: string, id: string) =>
  db
    .delete(prompts)
    .where(and(eq(prompts.userId, userId), eq(prompts.id, id)))
    .returning();

// ─── Supabase ─────────────────────────────────────────────────────────────

export async function listPromptsByUserSupabase<T = (typeof prompts.$inferSelect)[]>(
  supabase: SupabaseClient,
  userId: string
): Promise<T> {
  return selectByUserId<T>(supabase, TABLE, userId, { column: 'updated_at', ascending: false }) as Promise<T>;
}

export async function createPromptSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await insertOne(supabase, TABLE, userId, data);
}

export async function updatePromptSupabase(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateOne(supabase, TABLE, userId, id, data);
}

export async function deletePromptSupabase(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  await deleteOne(supabase, TABLE, userId, id);
}
