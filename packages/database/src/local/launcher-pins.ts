import type { LauncherPin } from '@mighty/types';
import { COLLECTIONS } from '@mighty/const';
import { read, write } from './storage';

export function getLauncherPins(): LauncherPin[] {
  return read<LauncherPin[]>(COLLECTIONS.LAUNCHER_PINS) || [];
}

export function saveLauncherPins(items: LauncherPin[]): void {
  write(COLLECTIONS.LAUNCHER_PINS, items);
}

export function pinCommand(commandId: string, label: string): LauncherPin {
  const items = getLauncherPins();
  const existing = items.find((i) => i.commandId === commandId);
  if (existing) return existing;
  const newPin: LauncherPin = {
    id: `lp_${Date.now()}`,
    commandId,
    label,
    sortOrder: items.length,
  };
  items.push(newPin);
  write(COLLECTIONS.LAUNCHER_PINS, items);
  return newPin;
}

export function unpinCommand(commandId: string): boolean {
  const items = getLauncherPins();
  const filtered = items.filter((i) => i.commandId !== commandId);
  if (filtered.length === items.length) return false;
  write(COLLECTIONS.LAUNCHER_PINS, filtered);
  return true;
}

export function reorderPins(orderedIds: string[]): void {
  const items = getLauncherPins();
  const reordered = orderedIds
    .map((id, i) => {
      const item = items.find((p) => p.commandId === id);
      return item ? { ...item, sortOrder: i } : null;
    })
    .filter(Boolean) as LauncherPin[];
  write(COLLECTIONS.LAUNCHER_PINS, reordered);
}
