import type { Bookmark, BookmarkFolder } from '@mighty/types';
import { COLLECTIONS } from '@mighty/const';
import { generateId, read, write } from './storage';

export function getBookmarks(): Bookmark[] {
  return read<Bookmark[]>(COLLECTIONS.BOOKMARKS) || [];
}

export function saveBookmarks(items: Bookmark[]): void {
  write(COLLECTIONS.BOOKMARKS, items);
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

export function saveBookmarkFolders(items: BookmarkFolder[]): void {
  write(COLLECTIONS.BOOKMARK_FOLDERS, items);
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
