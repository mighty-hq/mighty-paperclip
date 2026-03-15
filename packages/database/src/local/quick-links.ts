import type { QuickLink } from '@mighty/types';
import { COLLECTIONS } from '@mighty/const';
import { generateId, read, write } from './storage';

export function getQuickLinks(): QuickLink[] {
  return read<QuickLink[]>(COLLECTIONS.QUICK_LINKS) || [];
}

export function saveQuickLinks(items: QuickLink[]): void {
  write(COLLECTIONS.QUICK_LINKS, items);
}

export function createQuickLink(data: Omit<QuickLink, 'id' | 'createdAt' | 'sortOrder'>): QuickLink {
  const items = getQuickLinks();
  const newItem: QuickLink = {
    ...data,
    id: generateId(),
    sortOrder: items.length,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  write(COLLECTIONS.QUICK_LINKS, items);
  return newItem;
}

export function updateQuickLink(id: string, data: Partial<QuickLink>): QuickLink | null {
  const items = getQuickLinks();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data };
  write(COLLECTIONS.QUICK_LINKS, items);
  return items[idx];
}

export function deleteQuickLink(id: string): boolean {
  const items = getQuickLinks();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  write(COLLECTIONS.QUICK_LINKS, filtered);
  return true;
}
