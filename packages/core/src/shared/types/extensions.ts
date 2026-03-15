import type { CommandItem } from './commands';

export interface ExtensionManifest {
  commands: ExtensionCommandDef[];
  description: string;
  icon: string;
  id: string;
  name: string;
  version: string;
}

export interface ExtensionCommandDef {
  id: string;
  keywords?: string[];
  mode: 'filter' | 'view' | 'no-view';
  name: string;
  subtitle?: string;
}

export interface ExtensionContext {
  clearResults: () => void;
  clipboard: {
    read: () => Promise<string>;
    write: (text: string) => Promise<void>;
  };
  hideWindow: () => void;
  setResults: (results: CommandItem[]) => void;
  shell: {
    open: (path: string) => Promise<void>;
    openExternal: (url: string) => Promise<void>;
  };
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  storage: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
}

export interface ExtensionModule {
  activate: (context: ExtensionContext) => ExtensionHandlers;
}

export interface ExtensionHandlers {
  getStaticCommands?: () => CommandItem[];
  onActionSelect?: (commandId: string, actionId: string) => void | Promise<void>;
  onCommandSelect?: (commandId: string) => void | Promise<void>;
  onDeactivate?: () => void;
  onSearchChange?: (query: string) => CommandItem[] | Promise<CommandItem[]>;
}

export interface RegisteredExtension {
  enabled: boolean;
  handlers: ExtensionHandlers;
  manifest: ExtensionManifest;
}
