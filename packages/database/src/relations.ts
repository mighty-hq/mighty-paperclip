import { relations } from 'drizzle-orm';
import { bookmarkFolders, bookmarks, categories, fileAssets, prompts, snippets, userSettings, users } from './schema';

export const categoryRelations = relations(categories, ({ many }) => ({
  snippets: many(snippets),
  prompts: many(prompts),
}));

export const snippetRelations = relations(snippets, ({ one }) => ({
  category: one(categories, {
    fields: [snippets.categoryId],
    references: [categories.id],
  }),
}));

export const promptRelations = relations(prompts, ({ one }) => ({
  category: one(categories, {
    fields: [prompts.categoryId],
    references: [categories.id],
  }),
}));

export const bookmarkFolderRelations = relations(bookmarkFolders, ({ one, many }) => ({
  parent: one(bookmarkFolders, {
    fields: [bookmarkFolders.parentId],
    references: [bookmarkFolders.id],
  }),
  children: many(bookmarkFolders),
  bookmarks: many(bookmarks),
}));

export const bookmarkRelations = relations(bookmarks, ({ one }) => ({
  folder: one(bookmarkFolders, {
    fields: [bookmarks.folderId],
    references: [bookmarkFolders.id],
  }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  avatarAsset: one(fileAssets, {
    fields: [users.avatarAssetId],
    references: [fileAssets.id],
  }),
  coverImageAsset: one(fileAssets, {
    fields: [users.coverImageAssetId],
    references: [fileAssets.id],
  }),
  createdAssets: many(fileAssets, {
    relationName: 'asset_created_by_user',
  }),
  updatedAssets: many(fileAssets, {
    relationName: 'asset_updated_by_user',
  }),
  ownedAssets: many(fileAssets, {
    relationName: 'asset_owner_user',
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const fileAssetsRelations = relations(fileAssets, ({ one }) => ({
  createdBy: one(users, {
    fields: [fileAssets.createdById],
    references: [users.id],
    relationName: 'asset_created_by_user',
  }),
  updatedBy: one(users, {
    fields: [fileAssets.updatedById],
    references: [users.id],
    relationName: 'asset_updated_by_user',
  }),
  owner: one(users, {
    fields: [fileAssets.userId],
    references: [users.id],
    relationName: 'asset_owner_user',
  }),
}));
