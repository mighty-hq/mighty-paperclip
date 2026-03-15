import { globalShortcut } from 'electron';
import { toggleWindow } from './window';
import { DEFAULT_HOTKEY } from './shared/constants';

let currentHotkey: string = DEFAULT_HOTKEY;

export function registerHotkey(accelerator: string = DEFAULT_HOTKEY): boolean {
  // Unregister previous if exists
  unregisterHotkey();

  const success = globalShortcut.register(accelerator, () => {
    toggleWindow();
  });

  if (success) {
    currentHotkey = accelerator;
  } else {
    console.error(`Failed to register hotkey: ${accelerator}`);
  }

  return success;
}

export function unregisterHotkey(): void {
  if (currentHotkey && globalShortcut.isRegistered(currentHotkey)) {
    globalShortcut.unregister(currentHotkey);
  }
}

export function unregisterAllHotkeys(): void {
  globalShortcut.unregisterAll();
}

export function getCurrentHotkey(): string {
  return currentHotkey;
}
