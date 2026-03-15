import { clipboard } from 'electron';
import { ClipboardEntry } from '../shared/types/clipboard';
import { CLIPBOARD_POLL_INTERVAL, CLIPBOARD_MAX_ENTRIES } from '../shared/constants';
import { getMainWindow } from '../window';
import { IPC } from '../shared/types/ipc-channels';
import { getStoreValue, setStoreValue } from '@mighty/utils/store';

let pollInterval: ReturnType<typeof setInterval> | null = null;
let lastContent = '';
let history: ClipboardEntry[] = [];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadHistory(): void {
  const saved = getStoreValue<ClipboardEntry[]>('clipboardHistory');
  if (saved && Array.isArray(saved)) {
    history = saved;
  }
}

function saveHistory(): void {
  setStoreValue('clipboardHistory', history);
}

export function startClipboardMonitor(): void {
  loadHistory();
  lastContent = clipboard.readText();

  pollInterval = setInterval(() => {
    try {
      const current = clipboard.readText();
      if (current && current !== lastContent) {
        lastContent = current;

        const entry: ClipboardEntry = {
          id: generateId(),
          content: current,
          timestamp: Date.now(),
          contentType: 'text',
          preview: current.slice(0, 200),
        };

        // Add to front, deduplicate
        history = history.filter((e) => e.content !== current);
        history.unshift(entry);

        // Trim to max size
        if (history.length > CLIPBOARD_MAX_ENTRIES) {
          history = history.slice(0, CLIPBOARD_MAX_ENTRIES);
        }

        saveHistory();

        // Notify renderer
        const win = getMainWindow();
        if (win) {
          win.webContents.send(IPC.CLIPBOARD_UPDATED, entry);
        }
      }
    } catch {
      // Clipboard read can fail sometimes, ignore
    }
  }, CLIPBOARD_POLL_INTERVAL);
}

export function stopClipboardMonitor(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

export function getClipboardHistory(limit?: number): ClipboardEntry[] {
  const max = limit ?? CLIPBOARD_MAX_ENTRIES;
  return history.slice(0, max);
}

export function clearClipboardHistory(): void {
  history = [];
  saveHistory();
}

export function copyToClipboard(text: string): void {
  clipboard.writeText(text);
  lastContent = text;
}
