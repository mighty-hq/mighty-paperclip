import Store from 'electron-store';
import { AppSettings, DEFAULT_SETTINGS } from '../shared/types/settings';

const store = new Store<{ settings: AppSettings }>({
  defaults: {
    settings: DEFAULT_SETTINGS,
  },
});

export function getSettings(): AppSettings {
  return store.get('settings');
}

export function setSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...partial };
  store.set('settings', updated);
  return updated;
}

export function getStoreValue<T>(key: string): T | undefined {
  return store.get(key) as T | undefined;
}

export function setStoreValue<T>(key: string, value: T): void {
  store.set(key, value);
}

export default store;
