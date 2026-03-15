export const COLLECTIONS = {
  SNIPPETS: 'cf_snippets',
  PROMPTS: 'cf_prompts',
  CATEGORIES: 'cf_categories',
  PROMPT_CATEGORIES: 'cf_prompt_categories',
  CLIPBOARD: 'cf_clipboard',
  QUICK_LINKS: 'cf_quick_links',
  BOOKMARKS: 'cf_bookmarks',
  BOOKMARK_FOLDERS: 'cf_bookmark_folders',
  LAUNCHER_PINS: 'cf_launcher_pins',
  SETTINGS: 'cf_settings',
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;
export type CollectionValue = (typeof COLLECTIONS)[CollectionKey];
