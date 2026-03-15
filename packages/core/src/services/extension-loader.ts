import { clipboard, shell } from 'electron';
import {
  ExtensionManifest,
  ExtensionContext,
  ExtensionHandlers,
  RegisteredExtension,
  ExtensionModule,
} from '../shared/types/extensions';
import { CommandItem } from '../shared/types/commands';
import { getMainWindow, hideWindow } from '../window';
import { IPC } from '../shared/types/ipc-channels';
import { getStoreValue, setStoreValue } from '@mighty/utils/store';

const extensions = new Map<string, RegisteredExtension>();

function createExtensionContext(extensionId: string): ExtensionContext {
  return {
    setResults: (results: CommandItem[]) => {
      const win = getMainWindow();
      if (win) {
        // Results are handled through the search flow, not pushed directly
      }
    },
    clearResults: () => {
      // Handled through search flow
    },
    showToast: (message: string, type: 'success' | 'error' | 'info') => {
      const win = getMainWindow();
      if (win) {
        win.webContents.send(IPC.TOAST, { message, type });
      }
    },
    hideWindow: () => {
      hideWindow();
    },
    clipboard: {
      read: async () => clipboard.readText(),
      write: async (text: string) => clipboard.writeText(text),
    },
    shell: {
      open: async (path: string) => {
        await shell.openPath(path);
      },
      openExternal: async (url: string) => {
        await shell.openExternal(url);
      },
    },
    storage: {
      get: async <T>(key: string): Promise<T | null> => {
        return getStoreValue<T>(`ext.${extensionId}.${key}`) ?? null;
      },
      set: async <T>(key: string, value: T): Promise<void> => {
        setStoreValue(`ext.${extensionId}.${key}`, value);
      },
      delete: async (key: string): Promise<void> => {
        setStoreValue(`ext.${extensionId}.${key}`, undefined);
      },
    },
  };
}

export function registerExtension(manifest: ExtensionManifest, module: ExtensionModule): void {
  try {
    const context = createExtensionContext(manifest.id);
    const handlers = module.activate(context);
    extensions.set(manifest.id, { manifest, handlers, enabled: true });
    console.log(`Extension loaded: ${manifest.name} (${manifest.id})`);
  } catch (err) {
    console.error(`Failed to load extension ${manifest.id}:`, err);
  }
}

export function getExtension(id: string): RegisteredExtension | undefined {
  return extensions.get(id);
}

export function getAllExtensions(): RegisteredExtension[] {
  return Array.from(extensions.values());
}

export async function searchAllExtensions(query: string): Promise<CommandItem[]> {
  const results: CommandItem[] = [];

  for (const [, ext] of extensions) {
    if (!ext.enabled) continue;
    try {
      // Get static commands
      if (ext.handlers.getStaticCommands) {
        results.push(...ext.handlers.getStaticCommands());
      }
      // Get dynamic search results
      if (ext.handlers.onSearchChange) {
        const dynamicResults = await ext.handlers.onSearchChange(query);
        results.push(...dynamicResults);
      }
    } catch (err) {
      console.error(`Extension ${ext.manifest.id} search error:`, err);
    }
  }

  return results;
}

export async function executeCommand(extensionId: string, commandId: string): Promise<void> {
  const ext = extensions.get(extensionId);
  if (!ext || !ext.handlers.onCommandSelect) return;
  await ext.handlers.onCommandSelect(commandId);
}

export async function executeAction(extensionId: string, commandId: string, actionId: string): Promise<void> {
  const ext = extensions.get(extensionId);
  if (!ext || !ext.handlers.onActionSelect) return;
  await ext.handlers.onActionSelect(commandId, actionId);
}
