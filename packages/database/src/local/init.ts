import { COLLECTIONS, DEFAULT_SETTINGS } from '@mighty/const';
import { read, write } from './storage';

export function initDatabase(): void {
  if (!read(COLLECTIONS.SNIPPETS)) write(COLLECTIONS.SNIPPETS, []);
  if (!read(COLLECTIONS.PROMPTS)) write(COLLECTIONS.PROMPTS, []);
  if (!read(COLLECTIONS.CATEGORIES)) write(COLLECTIONS.CATEGORIES, []);
  if (!read(COLLECTIONS.PROMPT_CATEGORIES)) write(COLLECTIONS.PROMPT_CATEGORIES, []);
  if (!read(COLLECTIONS.CLIPBOARD)) write(COLLECTIONS.CLIPBOARD, []);
  if (!read(COLLECTIONS.QUICK_LINKS)) write(COLLECTIONS.QUICK_LINKS, []);
  if (!read(COLLECTIONS.BOOKMARKS)) write(COLLECTIONS.BOOKMARKS, []);
  if (!read(COLLECTIONS.BOOKMARK_FOLDERS)) write(COLLECTIONS.BOOKMARK_FOLDERS, []);
  if (!read(COLLECTIONS.LAUNCHER_PINS)) write(COLLECTIONS.LAUNCHER_PINS, []);
  if (!read(COLLECTIONS.SETTINGS)) write(COLLECTIONS.SETTINGS, DEFAULT_SETTINGS);
}

export function resetDatabase(): void {
  for (const key of Object.values(COLLECTIONS)) {
    localStorage.removeItem(key);
  }
  initDatabase();
}
