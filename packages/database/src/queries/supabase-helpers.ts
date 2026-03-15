import type { SupabaseClient } from '@supabase/supabase-js';

const USER_ID_COL = 'user_id';

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())] = v;
  }
  return out;
}

function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
}

function mapRows<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((r) => toCamelCase(r) as T);
}

export async function selectByUserId<T>(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  orderBy?: { column: string; ascending?: boolean }
): Promise<T[]> {
  let q = supabase.from(table).select('*').eq(USER_ID_COL, userId);
  if (orderBy) {
    q = q.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  }
  const { data, error } = await q;
  if (error) throw error;
  return mapRows<T>((data ?? []) as Record<string, unknown>[]);
}

export async function insertOne(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from(table).insert(toSnakeCase({ ...data, userId }) as Record<string, unknown>);
  if (error) throw error;
}

export async function updateOne(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .update(toSnakeCase(data) as Record<string, unknown>)
    .eq('id', id)
    .eq(USER_ID_COL, userId);
  if (error) throw error;
}

export async function deleteOne(supabase: SupabaseClient, table: string, userId: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id).eq(USER_ID_COL, userId);
  if (error) throw error;
}

export async function upsertOne(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from(table).upsert(toSnakeCase({ ...data, userId }) as Record<string, unknown>);
  if (error) throw error;
}
