import type {
  Snippet,
  Prompt,
  Category,
  PromptCategory,
  ClipboardItem,
  Bookmark,
  BookmarkFolder,
  UserSettings,
} from '@mighty/types';
import { COLLECTIONS, DEFAULT_SETTINGS } from '@mighty/const';

function generateId(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return randomUuid;
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function initDatabase(): void {
  if (!read(COLLECTIONS.SNIPPETS)) write(COLLECTIONS.SNIPPETS, []);
  if (!read(COLLECTIONS.PROMPTS)) write(COLLECTIONS.PROMPTS, []);
  if (!read(COLLECTIONS.CATEGORIES)) write(COLLECTIONS.CATEGORIES, []);
  if (!read(COLLECTIONS.PROMPT_CATEGORIES)) write(COLLECTIONS.PROMPT_CATEGORIES, []);
  if (!read(COLLECTIONS.CLIPBOARD)) write(COLLECTIONS.CLIPBOARD, []);
  if (!read(COLLECTIONS.BOOKMARKS)) write(COLLECTIONS.BOOKMARKS, []);
  if (!read(COLLECTIONS.BOOKMARK_FOLDERS)) write(COLLECTIONS.BOOKMARK_FOLDERS, []);
  if (!read(COLLECTIONS.SETTINGS)) write(COLLECTIONS.SETTINGS, DEFAULT_SETTINGS);
}

// ── Snippets ──────────────────────────────────────────────
export function getSnippets(): Snippet[] {
  return read<Snippet[]>(COLLECTIONS.SNIPPETS) || [];
}

export function setSnippets(items: Snippet[]): void {
  write(COLLECTIONS.SNIPPETS, items);
}

export function getSnippetById(id: string): Snippet | undefined {
  return getSnippets().find((s) => s.id === id);
}

export function createSnippet(
  data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'sortOrder'>
): Snippet {
  const now = new Date().toISOString();
  const snippet: Snippet = {
    ...data,
    id: generateId(),
    usageCount: 0,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  };
  const all = getSnippets();
  all.push(snippet);
  write(COLLECTIONS.SNIPPETS, all);
  return snippet;
}

export function updateSnippet(id: string, data: Partial<Snippet>): Snippet | undefined {
  const all = getSnippets();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  write(COLLECTIONS.SNIPPETS, all);
  return all[idx];
}

export function deleteSnippet(id: string): boolean {
  const all = getSnippets();
  const filtered = all.filter((s) => s.id !== id);
  if (filtered.length === all.length) return false;
  write(COLLECTIONS.SNIPPETS, filtered);
  return true;
}

// ── Prompts ───────────────────────────────────────────────
export function getPrompts(): Prompt[] {
  return read<Prompt[]>(COLLECTIONS.PROMPTS) || [];
}

export function getPromptById(id: string): Prompt | undefined {
  return getPrompts().find((p) => p.id === id);
}

export function createPrompt(data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>): Prompt {
  const now = new Date().toISOString();
  const prompt: Prompt = {
    ...data,
    id: generateId(),
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  };
  const all = getPrompts();
  all.push(prompt);
  write(COLLECTIONS.PROMPTS, all);
  return prompt;
}

export function updatePrompt(id: string, data: Partial<Prompt>): Prompt | undefined {
  const all = getPrompts();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  write(COLLECTIONS.PROMPTS, all);
  return all[idx];
}

export function deletePrompt(id: string): boolean {
  const all = getPrompts();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length === all.length) return false;
  write(COLLECTIONS.PROMPTS, filtered);
  return true;
}

// ── Categories ────────────────────────────────────────────
export function getCategories(): Category[] {
  return read<Category[]>(COLLECTIONS.CATEGORIES) || [];
}

export function setCategories(items: Category[]): void {
  write(COLLECTIONS.CATEGORIES, items);
}

export function createCategory(data: Omit<Category, 'id'>): Category {
  const category: Category = { ...data, sortOrder: data.sortOrder ?? 0, id: generateId() };
  const all = getCategories();
  all.push(category);
  write(COLLECTIONS.CATEGORIES, all);
  return category;
}

export function updateCategory(id: string, data: Partial<Category>): Category | undefined {
  const all = getCategories();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...data };
  write(COLLECTIONS.CATEGORIES, all);
  return all[idx];
}

export function deleteCategory(id: string): boolean {
  const all = getCategories();
  const filtered = all.filter((c) => c.id !== id);
  if (filtered.length === all.length) return false;
  write(COLLECTIONS.CATEGORIES, filtered);
  return true;
}

// ── Prompt Categories ─────────────────────────────────────
export function getPromptCategories(): PromptCategory[] {
  return read<PromptCategory[]>(COLLECTIONS.PROMPT_CATEGORIES) || [];
}

export function updatePromptCategoryCounts(): void {
  const prompts = getPrompts();
  const cats = getPromptCategories();
  const updated = cats.map((cat) => {
    if (cat.id === 'all') return { ...cat, count: prompts.length };
    if (cat.id === 'favorites') return { ...cat, count: prompts.filter((p) => p.isFavorite).length };
    return { ...cat, count: prompts.filter((p) => p.categoryId === cat.id).length };
  });
  write(COLLECTIONS.PROMPT_CATEGORIES, updated);
}

// ── Clipboard ─────────────────────────────────────────────
export function getClipboard(): ClipboardItem[] {
  return read<ClipboardItem[]>(COLLECTIONS.CLIPBOARD) || [];
}

export function addClipboardItem(data: Omit<ClipboardItem, 'id' | 'timestamp'>): ClipboardItem {
  const item: ClipboardItem = { ...data, id: generateId(), timestamp: new Date().toISOString() };
  const all = getClipboard();
  all.unshift(item);
  write(COLLECTIONS.CLIPBOARD, all);
  return item;
}

export function deleteClipboardItem(id: string): boolean {
  const all = getClipboard();
  const filtered = all.filter((c) => c.id !== id);
  if (filtered.length === all.length) return false;
  write(COLLECTIONS.CLIPBOARD, filtered);
  return true;
}

export function clearClipboard(): void {
  write(COLLECTIONS.CLIPBOARD, []);
}

// ── Bookmarks ─────────────────────────────────────────────
export function getBookmarks(): Bookmark[] {
  return read<Bookmark[]>(COLLECTIONS.BOOKMARKS) || [];
}

export function createBookmark(data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Bookmark {
  const now = new Date().toISOString();
  const bookmark: Bookmark = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  const all = getBookmarks();
  all.push(bookmark);
  write(COLLECTIONS.BOOKMARKS, all);
  return bookmark;
}

export function updateBookmark(id: string, data: Partial<Bookmark>): Bookmark | undefined {
  const all = getBookmarks();
  const idx = all.findIndex((item) => item.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  write(COLLECTIONS.BOOKMARKS, all);
  return all[idx];
}

export function deleteBookmark(id: string): boolean {
  const all = getBookmarks();
  const filtered = all.filter((item) => item.id !== id);
  if (filtered.length === all.length) return false;
  write(COLLECTIONS.BOOKMARKS, filtered);
  return true;
}

export function getBookmarkFolders(): BookmarkFolder[] {
  return read<BookmarkFolder[]>(COLLECTIONS.BOOKMARK_FOLDERS) || [];
}

export function createBookmarkFolder(
  data: Omit<BookmarkFolder, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'> & { sortOrder?: number }
): BookmarkFolder {
  const now = new Date().toISOString();
  const folders = getBookmarkFolders();
  const sortOrder = data.sortOrder ?? folders.filter((folder) => folder.parentId === data.parentId).length;
  const folder: BookmarkFolder = {
    ...data,
    id: generateId(),
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
  folders.push(folder);
  write(COLLECTIONS.BOOKMARK_FOLDERS, folders);
  return folder;
}

export function updateBookmarkFolder(id: string, data: Partial<BookmarkFolder>): BookmarkFolder | undefined {
  const folders = getBookmarkFolders();
  const idx = folders.findIndex((folder) => folder.id === id);
  if (idx === -1) return undefined;
  folders[idx] = { ...folders[idx], ...data, updatedAt: new Date().toISOString() };
  write(COLLECTIONS.BOOKMARK_FOLDERS, folders);
  return folders[idx];
}

export function deleteBookmarkFolder(id: string): boolean {
  const folders = getBookmarkFolders();
  const filtered = folders.filter((folder) => folder.id !== id);
  if (filtered.length === folders.length) return false;
  write(COLLECTIONS.BOOKMARK_FOLDERS, filtered);
  return true;
}

// ── Settings ──────────────────────────────────────────────
export function getSettings(): UserSettings {
  return read<UserSettings>(COLLECTIONS.SETTINGS) || DEFAULT_SETTINGS;
}

export function updateSettings(data: Partial<UserSettings>): UserSettings {
  const current = getSettings();
  const updated = { ...current, ...data };
  write(COLLECTIONS.SETTINGS, updated);
  return updated;
}

// ── Reset / Debug ─────────────────────────────────────────
export function resetDatabase(): void {
  Object.values(COLLECTIONS).forEach((key) => localStorage.removeItem(key));
  initDatabase();
}
