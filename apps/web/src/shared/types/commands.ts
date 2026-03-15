export type CommandCategory =
  | 'application'
  | 'calculator'
  | 'clipboard'
  | 'file'
  | 'system'
  | 'window'
  | 'snippet'
  | 'bookmark'
  | 'script'
  | 'extension';

export interface CommandIcon {
  type: 'emoji' | 'url' | 'file' | 'text';
  value: string;
}

export interface Action {
  icon?: string;
  id: string;
  shortcut?: string;
  title: string;
}

export interface CommandItem {
  accessoryTitle?: string;
  actions: Action[];
  category: CommandCategory;
  extensionId: string;
  icon?: CommandIcon;
  id: string;
  keywords?: string[];
  subtitle?: string;
  title: string;
}

export interface CommandGroup {
  items: CommandItem[];
  title: string;
}
