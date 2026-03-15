# @mighty/database

Drizzle ORM + Supabase Postgres schema and query scaffolding for MightyHQ.

## Environment

Set one of:

- `POSTGRES_URL`
- `POSTGRES_URL`

Use your Supabase direct Postgres connection string when running migrations.

## Scripts

- `pnpm --filter @mighty/database db:generate` – generate SQL migration files from schema.
- `pnpm --filter @mighty/database db:migrate` – run generated migrations.
- `pnpm --filter @mighty/database db:push` – push schema directly (dev only).
- `pnpm --filter @mighty/database db:studio` – open Drizzle Studio.

## Included schema

- `categories`
- `snippets`
- `prompts`
- `clipboard_items`
- `quick_links`
- `bookmark_folders`
- `bookmarks`
- `launcher_pins`
- `user_settings`

## User relationships

All user-owned tables are relationally tied to Supabase Auth users via `auth.users(id)` foreign keys:

- `categories.user_id`
- `snippets.user_id`
- `prompts.user_id`
- `clipboard_items.user_id`
- `quick_links.user_id`
- `bookmark_folders.user_id`
- `bookmarks.user_id`
- `launcher_pins.user_id`
- `user_settings.user_id`

The migration also adds relational links for internal hierarchies:

- `snippets.category_id -> categories.id` (`ON DELETE SET NULL`)
- `prompts.category_id -> categories.id` (`ON DELETE SET NULL`)
- `bookmarks.folder_id -> bookmark_folders.id` (`ON DELETE CASCADE`)
- `bookmark_folders.parent_id -> bookmark_folders.id` (`ON DELETE CASCADE`)

## Seeding defaults for new users

The migration includes two seed entry points:

1. **Automatic seed trigger** on Supabase auth user creation:
   - Trigger: `on_auth_user_created_seed_defaults`
   - Source table: `auth.users`
   - Function: `public.seed_new_user_defaults()`
2. **Manual backfill function** for an existing user:
   - Function: `public.seed_defaults_for_user(target_user_id uuid)`

### What gets seeded

- One `user_settings` row with default values (`theme`, `scale`, startup/menu/animation flags, `history_retention`).
- Three default categories in `categories`:
  - `Development`
  - `Work`
  - `Personal`

### Idempotency

The seed logic is safe to run repeatedly:

- `user_settings` uses unique `user_id` + `ON CONFLICT DO NOTHING`
- `categories` uses unique (`user_id`, `name`, `type`) + `ON CONFLICT DO NOTHING`

### App-level seed helper

For service-layer usage (for example after custom signup flows), use:

- `seedUserDefaults(supabase, userId)` from `@mighty/database` — pass a Supabase server client and the user id to seed default categories and user settings.
