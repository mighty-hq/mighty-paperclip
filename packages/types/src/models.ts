export interface Snippet {
  categoryId: string;
  content: string;
  createdAt: string;
  description: string;
  id: string;
  isFavorite: boolean;
  language: string;
  sortOrder?: number;
  tags: string[];
  title: string;
  type: 'Editor' | 'Terminal' | 'Browser' | 'Email' | 'Note' | 'Other';
  updatedAt: string;
  usageCount: number;
}

export interface Prompt {
  categoryId: string;
  content: string;
  createdAt: string;
  description: string;
  icon: string;
  id: string;
  isFavorite: boolean;
  sortOrder?: number;
  subtitle: string;
  tags?: string[];
  title: string;
  updatedAt: string;
}

export interface Category {
  color: string;
  icon: string;
  id: string;
  name: string;
  sortOrder?: number;
  tags?: string[];
  type: 'snippets' | 'prompts' | 'skills' | 'agents' | 'bookmarks' | 'settings' | 'extensions' | 'pinned';
}

export interface PromptCategory {
  count: number;
  icon: string;
  id: string;
  name: string;
}

export interface ClipboardItem {
  content: string;
  id: string;
  isPinned: boolean;
  source: string;
  timestamp: string;
  type: 'text' | 'code' | 'link' | 'image';
}

export interface QuickLink {
  createdAt: string;
  icon: string;
  id: string;
  isPinned: boolean;
  sortOrder: number;
  title: string;
  url: string;
}

export interface BookmarkFolder {
  createdAt: string;
  icon: string;
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  updatedAt: string;
}

export interface Bookmark {
  createdAt: string;
  description: string;
  folderId: string;
  icon: string;
  id: string;
  isFavorite: boolean;
  tags: string[];
  title: string;
  updatedAt: string;
  url: string;
}

export interface LauncherPin {
  commandId: string;
  id: string;
  label: string;
  sortOrder: number;
}

export interface UserSettings {
  animations: boolean;
  autoUpdate: boolean;
  historyRetention: '7d' | '30d' | '90d' | 'forever';
  launchOnStartup: boolean;
  scale: 'small' | 'medium' | 'large';
  showInMenuBar: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface Command {
  action: string;
  category: string;
  icon: string;
  id: string;
  subtitle: string;
  title: string;
}

export interface PluginManifest {
  author: string;
  commands?: PluginCommand[];
  description: string;
  enabled: boolean;
  icon: string;
  id: string;
  name: string;
  panels?: PluginPanel[];
  settings?: PluginSetting[];
  version: string;
}

export interface PluginCommand {
  action: (api: PluginAPI) => void | Promise<void>;
  icon?: string;
  id: string;
  mode?: 'view' | 'no-view';
  panelId?: string;
  subtitle: string;
  title: string;
}

export interface PluginPanel {
  component: React.ComponentType<{ api: PluginAPI }>;
  icon?: string;
  id: string;
  title: string;
}

export interface PluginSetting {
  default: unknown;
  key: string;
  label: string;
  options?: { label: string; value: string }[];
  type: 'text' | 'toggle' | 'select' | 'number';
}

export interface PluginAPI {
  clipboard: {
    getHistory: () => unknown[];
    add: (data: any) => any;
    copyToClipboard: (text: string) => Promise<void>;
  };
  getPluginSetting: (key: string) => unknown;
  prompts: {
    getAll: () => unknown[];
    create: (data: any) => any;
    update: (id: string, data: any) => any;
    remove: (id: string) => boolean;
  };
  quickLinks: {
    getAll: () => unknown[];
    create: (data: any) => any;
    remove: (id: string) => boolean;
  };
  setPluginSetting: (key: string, value: unknown) => void;
  snippets: {
    getAll: () => unknown[];
    create: (data: any) => any;
    update: (id: string, data: any) => any;
    remove: (id: string) => boolean;
  };
  ui: {
    showToast: (opts: { title: string; description?: string; variant?: string; duration?: number }) => void;
    closeLauncher: () => void;
  };
}
