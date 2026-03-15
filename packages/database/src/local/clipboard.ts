import type { ClipboardItem } from '@mighty/types';
import { COLLECTIONS } from '@mighty/const';
import { generateId, read, write } from './storage';

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
