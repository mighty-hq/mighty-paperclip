import type { PromptCategory } from '@mighty/types';
import { COLLECTIONS } from '@mighty/const';
import { read, write } from './storage';
import { getPrompts } from './prompts';

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
