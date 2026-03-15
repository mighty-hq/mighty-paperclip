import { boolean as pgBoolean, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';
import { users } from './users';

export const userSettings = pgTable(
  'user_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    theme: text('theme').notNull().default('dark'),
    scale: text('scale').notNull().default('medium'),
    launchOnStartup: pgBoolean('launch_on_startup').notNull().default(false),
    showInMenuBar: pgBoolean('show_in_menu_bar').notNull().default(true),
    autoUpdate: pgBoolean('auto_update').notNull().default(true),
    animations: pgBoolean('animations').notNull().default(true),
    historyRetention: text('history_retention').notNull().default('30d'),
    createdAt,
    updatedAt,
  },
  (table) => ({
    uniqueUserIdx: uniqueIndex('user_settings_user_id_uidx').on(table.userId),
  })
);

export type UserSettingsRow = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
