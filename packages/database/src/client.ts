import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createSupabaseBrowserClient } from './supabase/client';

/**
 * Type for Drizzle DB used by query function signatures. The real type and
 * createDatabaseClient() live in server-client.ts (Node-only). Import from
 * '@mighty/database/server' for migrations and server-side scripts.
 */
export type DatabaseClient = any;

/** Supabase browser client for app usage (auth, realtime, REST). */
export const createSupabaseClient = (): SupabaseClient => createSupabaseBrowserClient();

export type { SupabaseClient };
