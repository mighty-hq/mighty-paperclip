import type { Prompt } from '@mighty/types';
import { COLLECTIONS } from '@mighty/const';
import { generateId, read, write } from './storage';

export function getPrompts(): Prompt[] {
  return read<Prompt[]>(COLLECTIONS.PROMPTS) || [];
}

export function getPromptById(id: string): Prompt | undefined {
  return getPrompts().find((p) => p.id === id);
}

export function createPrompt(data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Prompt {
  const now = new Date().toISOString();
  const prompt: Prompt = { ...data, id: generateId(), createdAt: now, updatedAt: now };
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
