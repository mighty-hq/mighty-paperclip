import type { Snippet } from '@mighty/types';
import { COLLECTIONS } from '@mighty/const';
import { generateId, read, write } from './storage';

export function getSnippets(): Snippet[] {
  return read<Snippet[]>(COLLECTIONS.SNIPPETS) || [];
}

export function setSnippets(items: Snippet[]): void {
  write(COLLECTIONS.SNIPPETS, items);
}

export function getSnippetById(id: string): Snippet | undefined {
  return getSnippets().find((s) => s.id === id);
}

export function createSnippet(data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Snippet {
  const now = new Date().toISOString();
  const snippet: Snippet = { ...data, id: generateId(), usageCount: 0, createdAt: now, updatedAt: now };
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
