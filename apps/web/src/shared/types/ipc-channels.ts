import type { CommandItem } from './commands';
import type { ClipboardEntry } from './clipboard';
import type { AppSettings } from './settings';

// IPC Channel constants
export const IPC = {
  // Renderer -> Main (invoke/handle)
  SEARCH_COMMANDS: 'search:commands',
  EXECUTE_COMMAND: 'execute:command',
  EXECUTE_ACTION: 'execute:action',
  CLIPBOARD_GET_HISTORY: 'clipboard:getHistory',
  CLIPBOARD_COPY: 'clipboard:copy',
  CLIPBOARD_CLEAR: 'clipboard:clear',
  SYSTEM_COMMAND: 'system:command',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  EXTENSION_LIST: 'extension:list',
  LAUNCH_APP: 'launch:app',
  SEARCH_FILES: 'search:files',
  WINDOW_MANAGE: 'window:manage',
  SNIPPET_LIST: 'snippet:list',
  SNIPPET_SAVE: 'snippet:save',
  SNIPPET_DELETE: 'snippet:delete',
  BOOKMARK_LIST: 'bookmark:list',
  BOOKMARK_SAVE: 'bookmark:save',
  BOOKMARK_DELETE: 'bookmark:delete',
  SCRIPT_RUN: 'script:run',
  HIDE_WINDOW: 'hide:window',

  // Main -> Renderer (send)
  WINDOW_SHOW: 'window:show',
  WINDOW_HIDE: 'window:hide',
  CLIPBOARD_UPDATED: 'clipboard:updated',
  TOAST: 'toast:show',
} as const;

export type SystemCommand = 'sleep' | 'lock' | 'shutdown' | 'restart' | 'emptyTrash' | 'toggleDarkMode';
export type WindowAction = 'leftHalf' | 'rightHalf' | 'topHalf' | 'bottomHalf' | 'maximize' | 'center' | 'restore';

export interface IPCPayloads {
  [IPC.SEARCH_COMMANDS]: { query: string };
  [IPC.EXECUTE_COMMAND]: { commandId: string; extensionId: string };
  [IPC.EXECUTE_ACTION]: { commandId: string; actionId: string; extensionId: string };
  [IPC.CLIPBOARD_GET_HISTORY]: { limit?: number };
  [IPC.CLIPBOARD_COPY]: { text: string };
  [IPC.CLIPBOARD_CLEAR]: void;
  [IPC.SYSTEM_COMMAND]: { command: SystemCommand };
  [IPC.SETTINGS_GET]: void;
  [IPC.SETTINGS_SET]: { settings: Partial<AppSettings> };
  [IPC.LAUNCH_APP]: { appPath: string };
  [IPC.SEARCH_FILES]: { query: string };
  [IPC.WINDOW_MANAGE]: { action: WindowAction };
  [IPC.SNIPPET_SAVE]: { id?: string; name: string; content: string; keyword?: string };
  [IPC.SNIPPET_DELETE]: { id: string };
  [IPC.BOOKMARK_SAVE]: { id?: string; name: string; url: string; keyword?: string };
  [IPC.BOOKMARK_DELETE]: { id: string };
  [IPC.SCRIPT_RUN]: { scriptPath: string };
  [IPC.HIDE_WINDOW]: void;
}

export interface IPCResponses {
  [IPC.SEARCH_COMMANDS]: CommandItem[];
  [IPC.EXECUTE_COMMAND]: { success: boolean; error?: string };
  [IPC.EXECUTE_ACTION]: { success: boolean; error?: string };
  [IPC.CLIPBOARD_GET_HISTORY]: ClipboardEntry[];
  [IPC.CLIPBOARD_COPY]: void;
  [IPC.CLIPBOARD_CLEAR]: void;
  [IPC.SYSTEM_COMMAND]: { success: boolean; error?: string };
  [IPC.SETTINGS_GET]: AppSettings;
  [IPC.SETTINGS_SET]: void;
  [IPC.LAUNCH_APP]: { success: boolean; error?: string };
  [IPC.SEARCH_FILES]: CommandItem[];
  [IPC.WINDOW_MANAGE]: { success: boolean; error?: string };
}
