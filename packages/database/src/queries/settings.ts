import type { SupabaseClient } from '@supabase/supabase-js';
import { and, eq } from 'drizzle-orm';
import type { DatabaseClient } from '../client';
import { userSettings } from '../schema';
import { selectByUserId, upsertOne } from './supabase-helpers';

const TABLE = 'user_settings';

// ─── Drizzle (direct Postgres) ─────────────────────────────────────────────

export const getUserSettings = async (db: DatabaseClient, userId: string) => {
  const rows = await db.query.userSettings.findMany({
    where: eq(userSettings.userId, userId),
    limit: 1,
  });
  return rows[0] ?? null;
};

export const upsertUserSettings = async (
  db: DatabaseClient,
  userId: string,
  values: Partial<Omit<typeof userSettings.$inferInsert, 'id' | 'userId' | 'createdAt'>>
) => {
  const existing = await getUserSettings(db, userId);
  if (!existing) {
    return db
      .insert(userSettings)
      .values({
        userId,
        ...values,
      })
      .returning();
  }

  return db
    .update(userSettings)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(userSettings.userId, userId), eq(userSettings.id, existing.id)))
    .returning();
};

// ─── Supabase ─────────────────────────────────────────────────────────────

export async function getUserSettingsSupabase<T = typeof userSettings.$inferSelect | null>(
  supabase: SupabaseClient,
  userId: string
): Promise<T | null> {
  const rows = await selectByUserId<T>(supabase, TABLE, userId);
  return rows[0] ?? null;
}

export async function upsertUserSettingsSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await upsertOne(supabase, TABLE, userId, data);
}
