import {
  type AnyPgColumn,
  boolean as pgBoolean,
  doublePrecision,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from './helpers';
import { users } from './users';

export const fileAssets = pgTable(
  'file_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    attributes: jsonb('attributes').$type<Record<string, unknown>>().notNull().default({}),
    asset: varchar('asset', { length: 800 }).notNull(),
    createdById: uuid('created_by_id').references((): AnyPgColumn => users.id),
    updatedById: uuid('updated_by_id').references((): AnyPgColumn => users.id),
    userId: uuid('user_id').references((): AnyPgColumn => users.id),
    isDeleted: pgBoolean('is_deleted').default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    isArchived: pgBoolean('is_archived').default(false),
    entityType: varchar('entity_type', { length: 255 }),
    entityIdentifier: varchar('entity_identifier', { length: 255 }),
    externalId: varchar('external_id', { length: 255 }),
    externalSource: varchar('external_source', { length: 255 }),
    isUploaded: pgBoolean('is_uploaded'),
    size: doublePrecision('size').notNull(),
    storageMetadata: jsonb('storage_metadata').$type<Record<string, unknown> | null>(),
    createdAt,
    updatedAt,
  },
  (table) => ({
    createdByIdx: index('file_asset_created_by_id_966942a0').on(table.createdById),
    updatedByIdx: index('file_asset_updated_by_id_d6aaf4f0').on(table.updatedById),
    userIdx: index('file_assets_user_id_ce1818dc').on(table.userId),
    entityTypeIdx: index('asset_entity_type_idx').on(table.entityType),
    entityIdentifierIdx: index('asset_entity_identifier_idx').on(table.entityIdentifier),
    entityIdx: index('asset_entity_idx').on(table.entityType, table.entityIdentifier),
    assetIdx: index('asset_asset_idx').on(table.asset),
  })
);

export type FileAsset = typeof fileAssets.$inferSelect;
export type NewFileAsset = typeof fileAssets.$inferInsert;
