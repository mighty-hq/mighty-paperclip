import { ipcMain } from 'electron';
import { IPC } from '../shared/types/ipc-channels';
import { searchAllExtensions, executeCommand, executeAction } from '../services/extension-loader';
import { getClipboardHistory, clearClipboardHistory, copyToClipboard } from '../services/clipboard-monitor';
import { getSettings, setSettings } from '@mighty/utils/store';
import { hideWindow } from '../window';

export function registerAllIPC(): void {
  // Search all extensions
  ipcMain.handle(IPC.SEARCH_COMMANDS, async (_event, payload: { query: string }) => {
    return searchAllExtensions(payload.query);
  });

  // Execute a command
  ipcMain.handle(IPC.EXECUTE_COMMAND, async (_event, payload: { commandId: string; extensionId: string }) => {
    try {
      await executeCommand(payload.extensionId, payload.commandId);
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  // Execute an action
  ipcMain.handle(
    IPC.EXECUTE_ACTION,
    async (_event, payload: { commandId: string; actionId: string; extensionId: string }) => {
      try {
        await executeAction(payload.extensionId, payload.commandId, payload.actionId);
        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }
  );

  // Clipboard history
  ipcMain.handle(IPC.CLIPBOARD_GET_HISTORY, async (_event, payload?: { limit?: number }) => {
    return getClipboardHistory(payload?.limit);
  });

  ipcMain.handle(IPC.CLIPBOARD_COPY, async (_event, payload: { text: string }) => {
    copyToClipboard(payload.text);
  });

  ipcMain.handle(IPC.CLIPBOARD_CLEAR, async () => {
    clearClipboardHistory();
  });

  // Settings
  ipcMain.handle(IPC.SETTINGS_GET, async () => {
    return getSettings();
  });

  ipcMain.handle(IPC.SETTINGS_SET, async (_event, payload: { settings: Record<string, unknown> }) => {
    setSettings(payload.settings);
  });

  // Hide window
  ipcMain.handle(IPC.HIDE_WINDOW, async () => {
    hideWindow();
  });
}
