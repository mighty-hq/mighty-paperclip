export interface AppSettings {
  bookmarks: BookmarkItem[];
  clipboardHistorySize: number;
  extensions: Record<string, boolean>;
  hotkey: string;
  launchAtLogin: boolean;
  scriptDirectory: string;
  showInDock: boolean;
  snippets: SnippetItem[];
  theme: 'dark' | 'light' | 'system';
}

export interface SnippetItem {
  content: string;
  createdAt: number;
  id: string;
  keyword?: string;
  name: string;
}

export interface BookmarkItem {
  createdAt: number;
  icon?: string;
  id: string;
  keyword?: string;
  name: string;
  url: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  hotkey: 'CommandOrControl+Space',
  launchAtLogin: false,
  theme: 'dark',
  clipboardHistorySize: 100,
  showInDock: false,
  extensions: {},
  snippets: [],
  bookmarks: [],
  scriptDirectory: '',
};
