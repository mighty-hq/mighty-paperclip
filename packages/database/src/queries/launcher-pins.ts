import type { SupabaseClient } from '@supabase/supabase-js';
import { and, asc, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../client';
import { launcherPins } from '../schema';
import { deleteOne, selectByUserId, updateOne, upsertOne } from './supabase-helpers';

const TABLE = 'launcher_pins';

// ─── Drizzle (direct Postgres) ─────────────────────────────────────────────

export const listLauncherPinsByUser = (db: DatabaseClient, userId: string) =>
  db.query.launcherPins.findMany({
    where: eq(launcherPins.userId, userId),
    orderBy: [asc(launcherPins.sortOrder)],
  });

export const upsertLauncherPin = (
  db: DatabaseClient,
  values: Omit<typeof launcherPins.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>
) =>
  db
    .insert(launcherPins)
    .values(values)
    .onConflictDoUpdate({
      target: [launcherPins.userId, launcherPins.commandId],
      set: {
        label: values.label,
        sortOrder: values.sortOrder,
        updatedAt: new Date(),
      },
    })
    .returning();

export const deleteLauncherPin = (db: DatabaseClient, userId: string, id: string) =>
  db
    .delete(launcherPins)
    .where(and(eq(launcherPins.userId, userId), eq(launcherPins.id, id)))
    .returning();

// ─── Supabase ─────────────────────────────────────────────────────────────

export async function listLauncherPinsByUserSupabase<T = (typeof launcherPins.$inferSelect)[]>(
  supabase: SupabaseClient,
  userId: string
): Promise<T> {
  return selectByUserId<T>(supabase, TABLE, userId, { column: 'sort_order', ascending: true }) as Promise<T>;
}

export async function pinCommandSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await upsertOne(supabase, TABLE, userId, data);
}

export async function unpinCommandSupabase(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  await deleteOne(supabase, TABLE, userId, id);
}

export async function updateLauncherPinSortOrderSupabase(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateOne(supabase, TABLE, userId, id, data);
}
