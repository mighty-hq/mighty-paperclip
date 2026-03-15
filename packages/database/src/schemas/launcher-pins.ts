import { index, integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';

export const launcherPins = pgTable(
  'launcher_pins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    commandId: text('command_id').notNull(),
    label: text('label').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('launcher_pins_user_id_idx').on(table.userId),
    uniqueUserCommandIdx: uniqueIndex('launcher_pins_user_command_uidx').on(table.userId, table.commandId),
  })
);

export type LauncherPin = typeof launcherPins.$inferSelect;
export type NewLauncherPin = typeof launcherPins.$inferInsert;
