import { createClient } from './supabase/client';
import * as cache from '@mighty/utils/localStorage';
import * as localDb from './database';
import { COLLECTIONS } from '@mighty/const';
import { toSnakeCase, mapRows } from '@mighty/utils';
import { auth } from './auth';

import type {
  Snippet,
  Prompt,
  Category,
  ClipboardItem,
  QuickLink,
  Bookmark,
  BookmarkFolder,
  LauncherPin,
  UserSettings,
  PromptCategory,
} from '@mighty/types';

// ── Generic CRUD with Supabase background sync ────────
function getSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  } catch {
    return null;
  }
}
async function getCurrentUserId2(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}
async function getCurrentUserId(): Promise<string | null> {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) return null;
  const userId = sessionStorage.getItem('userId');
  if (userId) {
    console.log('getCurrentUserId sessionStorage', userId);
    return userId;
  }

  const supabase = createClient();
  if (!supabase) return null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    sessionStorage.setItem('userId', user?.id || '');
    return user?.id || null;
  } catch {
    sessionStorage.removeItem('userId');
    return null;
  }
}
async function syncFromSupabase<T>(
  table: string,
  cacheKey: string,
  localGetter: () => T[],
  localSetter?: (items: T[]) => void
): Promise<T[]> {
  const supabase = createClient();
  if (!supabase) {
    return localGetter();
  }
  console.log('syncFromSupabase table', table);
  const userId = await getCurrentUserId();
  if (!userId) {
    return localGetter();
  }

  if (cache.isSynced(cacheKey)) {
    return cache.getCached<T[]>(cacheKey) || localGetter();
  }

  try {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId);
    if (error) throw error;
    const items = mapRows<T>(data || []);
    cache.setCache(cacheKey, items);
    cache.markSynced(cacheKey);
    if (localSetter) localSetter(items);
    return items;
  } catch {
    cache.markSynced(cacheKey);
    const local = localGetter();
    cache.setCache(cacheKey, local);
    return local;
  }
}

async function writeToSupabase(
  table: string,
  cacheKey: string,
  operation: 'insert' | 'update' | 'delete' | 'upsert',
  data?: Record<string, unknown>,
  id?: string
): Promise<void> {
  cache.invalidateCache(cacheKey);
  const supabase = createClient();
  if (!supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;
  console.log('writeToSupabase table', table, operation, data, id);
  try {
    switch (operation) {
      case 'insert':
        await supabase.from(table).insert(toSnakeCase({ ...(data || {}), userId }));
        break;
      case 'update':
        await supabase.from(table).update(toSnakeCase(data!)).eq('id', id!).eq('user_id', userId);
        break;
      case 'delete':
        await supabase.from(table).delete().eq('id', id!).eq('user_id', userId);
        break;
      case 'upsert':
        await supabase.from(table).upsert(toSnakeCase({ ...(data || {}), userId }));
        break;
    }
  } catch {
    // Supabase write failed — local data is still the source of truth
  }
}

// ── Snippets ──────────────────────────────────────────

export function getSnippets(): Snippet[] {
  const cached = cache.getCached<Snippet[]>(COLLECTIONS.SNIPPETS);
  return cached || localDb.getSnippets();
}

export async function syncSnippets(): Promise<Snippet[]> {
  return syncFromSupabase<Snippet>('snippets', COLLECTIONS.SNIPPETS, localDb.getSnippets, localDb.setSnippets);
}

export function createSnippet(
  data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'sortOrder'>
): Snippet {
  const result = localDb.createSnippet(data);
  cache.setCache(COLLECTIONS.SNIPPETS, localDb.getSnippets());
  writeToSupabase('snippets', COLLECTIONS.SNIPPETS, 'insert', {
    ...result,
    categoryId: result.categoryId || null,
  } as unknown as Record<string, unknown>);
  return result;
}

export function updateSnippet(id: string, data: Partial<Snippet>): Snippet | null {
  const result = localDb.updateSnippet(id, data);
  if (result) {
    cache.setCache(COLLECTIONS.SNIPPETS, localDb.getSnippets());
    writeToSupabase(
      'snippets',
      COLLECTIONS.SNIPPETS,
      'update',
      {
        ...data,
        categoryId: data.categoryId === '' ? null : data.categoryId,
      } as unknown as Record<string, unknown>,
      id
    );
  }
  return result as Snippet | null;
}

export function deleteSnippet(id: string): boolean {
  const result = localDb.deleteSnippet(id);
  if (result) {
    cache.setCache(COLLECTIONS.SNIPPETS, localDb.getSnippets());
    writeToSupabase('snippets', COLLECTIONS.SNIPPETS, 'delete', undefined, id);
  }
  return result;
}

// ── Prompts ───────────────────────────────────────────

export function getPrompts(): Prompt[] {
  const cached = cache.getCached<Prompt[]>(COLLECTIONS.PROMPTS);
  return cached || localDb.getPrompts();
}

export async function syncPrompts(): Promise<Prompt[]> {
  return syncFromSupabase<Prompt>('prompts', COLLECTIONS.PROMPTS, localDb.getPrompts);
}

export function createPrompt(data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>): Prompt {
  const result = localDb.createPrompt(data);
  localDb.updatePromptCategoryCounts();
  cache.setCache(COLLECTIONS.PROMPTS, localDb.getPrompts());
  writeToSupabase('prompts', COLLECTIONS.PROMPTS, 'insert', result as unknown as Record<string, unknown>);
  return result;
}

export function updatePrompt(id: string, data: Partial<Prompt>): Prompt | null {
  const result = localDb.updatePrompt(id, data);
  localDb.updatePromptCategoryCounts();
  if (result) {
    cache.setCache(COLLECTIONS.PROMPTS, localDb.getPrompts());
    writeToSupabase('prompts', COLLECTIONS.PROMPTS, 'update', data as unknown as Record<string, unknown>, id);
  }
  return result as Prompt | null;
}

export function deletePrompt(id: string): boolean {
  const result = localDb.deletePrompt(id);
  localDb.updatePromptCategoryCounts();
  if (result) {
    cache.setCache(COLLECTIONS.PROMPTS, localDb.getPrompts());
    writeToSupabase('prompts', COLLECTIONS.PROMPTS, 'delete', undefined, id);
  }
  return result;
}

// ── Categories ────────────────────────────────────────

export function getCategories(): Category[] {
  const cached = cache.getCached<Category[]>(COLLECTIONS.CATEGORIES);
  return cached || localDb.getCategories();
}

export async function syncCategories(): Promise<Category[]> {
  return syncFromSupabase<Category>('categories', COLLECTIONS.CATEGORIES, localDb.getCategories, localDb.setCategories);
}

export function createCategory(data: Omit<Category, 'id'>): Category {
  const result = localDb.createCategory(data);
  writeToSupabase('categories', COLLECTIONS.CATEGORIES, 'insert', result as unknown as Record<string, unknown>);
  return result;
}

export function updateCategory(id: string, data: Partial<Category>): Category | null {
  const result = localDb.updateCategory(id, data);
  if (result)
    writeToSupabase('categories', COLLECTIONS.CATEGORIES, 'update', data as unknown as Record<string, unknown>, id);
  return result as Category | null;
}

export function deleteCategory(id: string): boolean {
  const result = localDb.deleteCategory(id);
  if (result) writeToSupabase('categories', COLLECTIONS.CATEGORIES, 'delete', undefined, id);
  return result;
}

// ── Prompt Categories ─────────────────────────────────

export function getPromptCategories(): PromptCategory[] {
  return localDb.getPromptCategories();
}

// ── Clipboard ─────────────────────────────────────────

export function getClipboard(): ClipboardItem[] {
  const cached = cache.getCached<ClipboardItem[]>(COLLECTIONS.CLIPBOARD);
  return cached || localDb.getClipboard();
}

export function addClipboardItem(data: Omit<ClipboardItem, 'id' | 'timestamp'>): ClipboardItem {
  const result = localDb.addClipboardItem(data);
  writeToSupabase('clipboard_items', COLLECTIONS.CLIPBOARD, 'insert', result as unknown as Record<string, unknown>);
  return result;
}

export function deleteClipboardItem(id: string): boolean {
  const result = localDb.deleteClipboardItem(id);
  if (result) writeToSupabase('clipboard_items', COLLECTIONS.CLIPBOARD, 'delete', undefined, id);
  return result;
}

export function clearClipboard(): void {
  localDb.clearClipboard();
  cache.invalidateCache(COLLECTIONS.CLIPBOARD);
}

// ── Quick Links ───────────────────────────────────────

function getLocalQuickLinks(): QuickLink[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS.QUICK_LINKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalQuickLinks(items: QuickLink[]): void {
  localStorage.setItem(COLLECTIONS.QUICK_LINKS, JSON.stringify(items));
}

export function getQuickLinks(): QuickLink[] {
  const cached = cache.getCached<QuickLink[]>(COLLECTIONS.QUICK_LINKS);
  return cached || getLocalQuickLinks();
}

export async function syncQuickLinks(): Promise<QuickLink[]> {
  return syncFromSupabase<QuickLink>('quick_links', COLLECTIONS.QUICK_LINKS, getLocalQuickLinks, saveLocalQuickLinks);
}

export function createQuickLink(data: Omit<QuickLink, 'id' | 'createdAt' | 'sortOrder'>): QuickLink {
  const items = getLocalQuickLinks();
  const newItem: QuickLink = {
    ...data,
    id: 'ql_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    sortOrder: items.length,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveLocalQuickLinks(items);
  cache.invalidateCache(COLLECTIONS.QUICK_LINKS);
  writeToSupabase('quick_links', COLLECTIONS.QUICK_LINKS, 'insert', newItem as unknown as Record<string, unknown>);
  return newItem;
}

export function updateQuickLink(id: string, data: Partial<QuickLink>): QuickLink | null {
  const items = getLocalQuickLinks();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data };
  saveLocalQuickLinks(items);
  cache.invalidateCache(COLLECTIONS.QUICK_LINKS);
  writeToSupabase('quick_links', COLLECTIONS.QUICK_LINKS, 'update', data as unknown as Record<string, unknown>, id);
  return items[idx];
}

export function deleteQuickLink(id: string): boolean {
  const items = getLocalQuickLinks();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  saveLocalQuickLinks(filtered);
  cache.invalidateCache(COLLECTIONS.QUICK_LINKS);
  writeToSupabase('quick_links', COLLECTIONS.QUICK_LINKS, 'delete', undefined, id);
  return true;
}

// ── Bookmarks ───────────────────────────────────────

function getLocalBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBookmarks(items: Bookmark[]): void {
  localStorage.setItem(COLLECTIONS.BOOKMARKS, JSON.stringify(items));
}

function getLocalBookmarkFolders(): BookmarkFolder[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS.BOOKMARK_FOLDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBookmarkFolders(items: BookmarkFolder[]): void {
  localStorage.setItem(COLLECTIONS.BOOKMARK_FOLDERS, JSON.stringify(items));
}

function collectFolderDescendants(folders: BookmarkFolder[], folderId: string): string[] {
  const out: string[] = [folderId];
  let cursor = 0;
  while (cursor < out.length) {
    const current = out[cursor++];
    folders.filter((folder) => folder.parentId === current).forEach((child) => out.push(child.id));
  }
  return out;
}

export function getBookmarks(): Bookmark[] {
  const cached = cache.getCached<Bookmark[]>(COLLECTIONS.BOOKMARKS);
  return cached || getLocalBookmarks();
}

export async function syncBookmarks(): Promise<Bookmark[]> {
  return syncFromSupabase<Bookmark>('bookmarks', COLLECTIONS.BOOKMARKS, getLocalBookmarks, saveLocalBookmarks);
}

export function createBookmark(data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Bookmark {
  const items = getLocalBookmarks();
  const now = new Date().toISOString();
  const newItem: Bookmark = {
    ...data,
    id: 'bm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    createdAt: now,
    updatedAt: now,
  };
  items.push(newItem);
  saveLocalBookmarks(items);
  cache.invalidateCache(COLLECTIONS.BOOKMARKS);
  writeToSupabase('bookmarks', COLLECTIONS.BOOKMARKS, 'insert', newItem as unknown as Record<string, unknown>);
  return newItem;
}

export function updateBookmark(id: string, data: Partial<Bookmark>): Bookmark | null {
  const items = getLocalBookmarks();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
  saveLocalBookmarks(items);
  cache.invalidateCache(COLLECTIONS.BOOKMARKS);
  writeToSupabase('bookmarks', COLLECTIONS.BOOKMARKS, 'update', data as unknown as Record<string, unknown>, id);
  return items[idx];
}

export function deleteBookmark(id: string): boolean {
  const items = getLocalBookmarks();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  saveLocalBookmarks(filtered);
  cache.invalidateCache(COLLECTIONS.BOOKMARKS);
  writeToSupabase('bookmarks', COLLECTIONS.BOOKMARKS, 'delete', undefined, id);
  return true;
}

export function getBookmarkFolders(): BookmarkFolder[] {
  const cached = cache.getCached<BookmarkFolder[]>(COLLECTIONS.BOOKMARK_FOLDERS);
  return cached || getLocalBookmarkFolders();
}

export async function syncBookmarkFolders(): Promise<BookmarkFolder[]> {
  return syncFromSupabase<BookmarkFolder>(
    'bookmark_folders',
    COLLECTIONS.BOOKMARK_FOLDERS,
    getLocalBookmarkFolders,
    saveLocalBookmarkFolders
  );
}

export function createBookmarkFolder(
  data: Omit<BookmarkFolder, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'> & { sortOrder?: number }
): BookmarkFolder {
  const folders = getLocalBookmarkFolders();
  const now = new Date().toISOString();
  const sortOrder = data.sortOrder ?? folders.filter((folder) => folder.parentId === data.parentId).length;
  const folder: BookmarkFolder = {
    ...data,
    id: 'bf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
  folders.push(folder);
  saveLocalBookmarkFolders(folders);
  cache.invalidateCache(COLLECTIONS.BOOKMARK_FOLDERS);
  writeToSupabase(
    'bookmark_folders',
    COLLECTIONS.BOOKMARK_FOLDERS,
    'insert',
    folder as unknown as Record<string, unknown>
  );
  return folder;
}

export function updateBookmarkFolder(id: string, data: Partial<BookmarkFolder>): BookmarkFolder | null {
  const folders = getLocalBookmarkFolders();
  const idx = folders.findIndex((folder) => folder.id === id);
  if (idx === -1) return null;
  folders[idx] = { ...folders[idx], ...data, updatedAt: new Date().toISOString() };
  saveLocalBookmarkFolders(folders);
  cache.invalidateCache(COLLECTIONS.BOOKMARK_FOLDERS);
  writeToSupabase(
    'bookmark_folders',
    COLLECTIONS.BOOKMARK_FOLDERS,
    'update',
    data as unknown as Record<string, unknown>,
    id
  );
  return folders[idx];
}

export function deleteBookmarkFolder(id: string): boolean {
  const folders = getLocalBookmarkFolders();
  const descendantIds = new Set(collectFolderDescendants(folders, id));
  if (!descendantIds.has(id)) return false;

  const remainingFolders = folders.filter((folder) => !descendantIds.has(folder.id));
  if (remainingFolders.length === folders.length) return false;
  saveLocalBookmarkFolders(remainingFolders);
  cache.invalidateCache(COLLECTIONS.BOOKMARK_FOLDERS);

  const bookmarks = getLocalBookmarks();
  const remainingBookmarks = bookmarks.filter((bookmark) => !descendantIds.has(bookmark.folderId));
  saveLocalBookmarks(remainingBookmarks);
  cache.invalidateCache(COLLECTIONS.BOOKMARKS);

  descendantIds.forEach((folderId) => {
    void writeToSupabase('bookmark_folders', COLLECTIONS.BOOKMARK_FOLDERS, 'delete', undefined, folderId);
  });
  bookmarks
    .filter((bookmark) => descendantIds.has(bookmark.folderId))
    .forEach((bookmark) => {
      void writeToSupabase('bookmarks', COLLECTIONS.BOOKMARKS, 'delete', undefined, bookmark.id);
    });

  return true;
}

// ── Launcher Pins ─────────────────────────────────────

function getLocalLauncherPins(): LauncherPin[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS.LAUNCHER_PINS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLauncherPins(items: LauncherPin[]): void {
  localStorage.setItem(COLLECTIONS.LAUNCHER_PINS, JSON.stringify(items));
}

export function getLauncherPins(): LauncherPin[] {
  const cached = cache.getCached<LauncherPin[]>(COLLECTIONS.LAUNCHER_PINS);
  return cached || getLocalLauncherPins();
}

export async function syncLauncherPins(): Promise<LauncherPin[]> {
  return syncFromSupabase<LauncherPin>(
    'launcher_pins',
    COLLECTIONS.LAUNCHER_PINS,
    getLocalLauncherPins,
    saveLocalLauncherPins
  );
}

export function pinCommand(commandId: string, label: string): LauncherPin {
  const items = getLocalLauncherPins();
  const existing = items.find((i) => i.commandId === commandId);
  if (existing) return existing;
  const newPin: LauncherPin = {
    id: 'lp_' + Date.now(),
    commandId,
    label,
    sortOrder: items.length,
  };
  items.push(newPin);
  saveLocalLauncherPins(items);
  cache.invalidateCache(COLLECTIONS.LAUNCHER_PINS);
  writeToSupabase('launcher_pins', COLLECTIONS.LAUNCHER_PINS, 'insert', newPin as unknown as Record<string, unknown>);
  return newPin;
}

export function unpinCommand(commandId: string): boolean {
  const items = getLocalLauncherPins();
  const removed = items.filter((i) => i.commandId === commandId);
  const filtered = items.filter((i) => i.commandId !== commandId);
  if (filtered.length === items.length) return false;
  saveLocalLauncherPins(filtered);
  cache.invalidateCache(COLLECTIONS.LAUNCHER_PINS);
  removed.forEach((item) => {
    void writeToSupabase('launcher_pins', COLLECTIONS.LAUNCHER_PINS, 'delete', undefined, item.id);
  });
  return true;
}

export function reorderPins(orderedIds: string[]): void {
  const items = getLocalLauncherPins();
  const reordered = orderedIds
    .map((id, i) => {
      const item = items.find((p) => p.commandId === id);
      return item ? { ...item, sortOrder: i } : null;
    })
    .filter(Boolean) as LauncherPin[];
  saveLocalLauncherPins(reordered);
  cache.invalidateCache(COLLECTIONS.LAUNCHER_PINS);
  reordered.forEach((item) => {
    void writeToSupabase(
      'launcher_pins',
      COLLECTIONS.LAUNCHER_PINS,
      'update',
      { sortOrder: item.sortOrder } as Record<string, unknown>,
      item.id
    );
  });
}

// ── Settings ──────────────────────────────────────────

export function getSettings(): UserSettings {
  return localDb.getSettings();
}

export function updateSettings(data: Partial<UserSettings>): UserSettings {
  const result = localDb.updateSettings(data);
  cache.invalidateCache(COLLECTIONS.SETTINGS);
  return result;
}
