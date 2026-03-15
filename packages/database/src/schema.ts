import {
  type AnyPgColumn,
  boolean as pgBoolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const createdAt = timestamp('created_at', { withTimezone: true }).defaultNow().notNull();

const updatedAt = timestamp('updated_at', { withTimezone: true }).defaultNow().notNull();

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    password: varchar('password', { length: 128 }).notNull(),
    lastLogin: timestamp('last_login', { withTimezone: true }),
    username: varchar('username', { length: 128 }).notNull(),
    mobileNumber: varchar('mobile_number', { length: 255 }),
    email: varchar('email', { length: 255 }),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    avatar: text('avatar'),
    dateJoined: timestamp('date_joined', { withTimezone: true }).defaultNow().notNull(),
    createdAt,
    updatedAt,
    lastLocation: varchar('last_location', { length: 255 }),
    createdLocation: varchar('created_location', { length: 255 }),
    isSuperuser: pgBoolean('is_superuser').notNull().default(false),
    isManaged: pgBoolean('is_managed').notNull().default(false),
    isPasswordExpired: pgBoolean('is_password_expired').notNull().default(false),
    isActive: pgBoolean('is_active').notNull().default(true),
    isStaff: pgBoolean('is_staff').notNull().default(false),
    isEmailVerified: pgBoolean('is_email_verified').notNull().default(false),
    isPasswordAutoset: pgBoolean('is_password_autoset'),
    token: varchar('token', { length: 64 }),
    userTimezone: varchar('user_timezone', { length: 255 }).notNull().default('UTC'),
    lastActive: timestamp('last_active', { withTimezone: true }),
    lastLoginTime: timestamp('last_login_time', { withTimezone: true }),
    lastLogoutTime: timestamp('last_logout_time', { withTimezone: true }),
    lastLoginIp: varchar('last_login_ip', { length: 255 }),
    lastLogoutIp: varchar('last_logout_ip', { length: 255 }),
    lastLoginMedium: varchar('last_login_medium', { length: 20 }),
    lastLoginUagent: text('last_login_uagent'),
    tokenUpdatedAt: timestamp('token_updated_at', { withTimezone: true }),
    isBot: pgBoolean('is_bot').notNull().default(false),
    coverImage: varchar('cover_image', { length: 800 }),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    avatarAssetId: uuid('avatar_asset_id').references((): AnyPgColumn => fileAssets.id),
    coverImageAssetId: uuid('cover_image_asset_id').references((): AnyPgColumn => fileAssets.id),
    botType: varchar('bot_type', { length: 30 }),
    isEmailValid: pgBoolean('is_email_valid').notNull().default(false),
    maskedAt: timestamp('masked_at', { withTimezone: true }),
    isPasswordResetRequired: pgBoolean('is_password_reset_required').notNull().default(false),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex('user_email_key').on(table.email),
    usernameUniqueIdx: uniqueIndex('user_username_key').on(table.username),
    usernameLikeIdx: index('user_username_cf016618_like').on(table.username),
    emailLikeIdx: index('user_email_54dc62b2_like').on(table.email),
    avatarAssetIdx: index('users_avatar_asset_id_50fa2043').on(table.avatarAssetId),
    coverImageAssetIdx: index('users_cover_image_asset_id_b9679cbc').on(table.coverImageAssetId),
  })
);

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

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    icon: text('icon').notNull().default('FolderOpen'),
    color: text('color').notNull().default('#3b82f6'),
    type: text('type').notNull().default('both'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('categories_user_id_idx').on(table.userId),
    userTypeIdx: index('categories_user_type_idx').on(table.userId, table.type),
    uniqueUserNameTypeIdx: uniqueIndex('categories_user_name_type_uidx').on(table.userId, table.name, table.type),
  })
);

export const snippets = pgTable(
  'snippets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    categoryId: uuid('category_id'),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    content: text('content').notNull().default(''),
    type: text('type').notNull().default('Other'),
    language: text('language').notNull().default('text'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isFavorite: pgBoolean('is_favorite').notNull().default(false),
    usageCount: integer('usage_count').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('snippets_user_id_idx').on(table.userId),
    categoryIdx: index('snippets_category_id_idx').on(table.categoryId),
  })
);

export const prompts = pgTable(
  'prompts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    categoryId: uuid('category_id'),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull().default(''),
    description: text('description').notNull().default(''),
    content: text('content').notNull().default(''),
    icon: text('icon').notNull().default('Sparkles'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isFavorite: pgBoolean('is_favorite').notNull().default(false),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('prompts_user_id_idx').on(table.userId),
    categoryIdx: index('prompts_category_id_idx').on(table.categoryId),
  })
);

export const clipboardItems = pgTable(
  'clipboard_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    content: text('content').notNull(),
    type: text('type').notNull().default('text'),
    source: text('source').notNull().default('app'),
    isPinned: pgBoolean('is_pinned').notNull().default(false),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('clipboard_items_user_id_idx').on(table.userId),
    timestampIdx: index('clipboard_items_timestamp_idx').on(table.timestamp),
  })
);

export const quickLinks = pgTable(
  'quick_links',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    title: text('title').notNull(),
    url: text('url').notNull(),
    icon: text('icon').notNull().default('Link'),
    isPinned: pgBoolean('is_pinned').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('quick_links_user_id_idx').on(table.userId),
  })
);

export const bookmarkFolders = pgTable(
  'bookmark_folders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    icon: text('icon').notNull().default('Folder'),
    parentId: uuid('parent_id'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('bookmark_folders_user_id_idx').on(table.userId),
    parentIdx: index('bookmark_folders_parent_id_idx').on(table.parentId),
  })
);

export const bookmarks = pgTable(
  'bookmarks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    folderId: uuid('folder_id').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    url: text('url').notNull(),
    icon: text('icon').notNull().default('Globe'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isFavorite: pgBoolean('is_favorite').notNull().default(false),
    createdAt,
    updatedAt,
  },
  (table) => ({
    userIdx: index('bookmarks_user_id_idx').on(table.userId),
    folderIdx: index('bookmarks_folder_id_idx').on(table.folderId),
  })
);

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
