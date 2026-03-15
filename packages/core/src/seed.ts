import { DEFAULT_USER_CATEGORIES, DEFAULT_USER_SETTINGS, DEFAULT_SNIPPETS, DEFAULT_PROMPTS } from '@mighty/database';

/** Seed data shape for legacy db/seed consumers. Sourced from @mighty/database. */
export const seedData = {
  categories: DEFAULT_USER_CATEGORIES.filter((c) => c.type === 'snippets'),
  promptCategories: DEFAULT_USER_CATEGORIES.filter((c) => c.type === 'prompts'),
  snippets: DEFAULT_SNIPPETS,
  prompts: DEFAULT_PROMPTS,
  clipboard: [] as Array<{ content: string; type: string }>,
  settings: DEFAULT_USER_SETTINGS,
};
