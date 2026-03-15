import type { Category } from '@mighty/types';
import { COLLECTIONS } from '@mighty/const';
import { generateId, read, write } from './storage';

export function getCategories(): Category[] {
  return read<Category[]>(COLLECTIONS.CATEGORIES) || [];
}

export function setCategories(items: Category[]): void {
  write(COLLECTIONS.CATEGORIES, items);
}

export function createCategory(data: Omit<Category, 'id'>): Category {
  const category: Category = { ...data, id: generateId() };
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
