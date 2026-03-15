import type { UserSettings } from '@mighty/types';
import { COLLECTIONS, DEFAULT_SETTINGS } from '@mighty/const';
import { read, write } from './storage';

export function getSettings(): UserSettings {
  return read<UserSettings>(COLLECTIONS.SETTINGS) || DEFAULT_SETTINGS;
}

export function updateSettings(data: Partial<UserSettings>): UserSettings {
  const current = getSettings();
  const updated = { ...current, ...data };
  write(COLLECTIONS.SETTINGS, updated);
  return updated;
}
