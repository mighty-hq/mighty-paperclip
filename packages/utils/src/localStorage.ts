const PREV_KEY = 'MIGHTY_GLOBAL';

// LOBE_PREFERENCE for userStore
// LOBE_GLOBAL_PREFERENCE for globalStore
type StorageKey = 'MIGHTY_PREFERENCE' | 'MIGHTY_SYSTEM_STATUS';

export function getSessionStorage(): Storage | null {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
  } catch {
    return null;
  }
}

export function getLocalStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export async function getStorageUserId(): Promise<string | null> {
  try {
    const sessionStorage = getSessionStorage();
    if (!sessionStorage) return null;
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      console.log('getCurrentUserId sessionStorage', userId);
      return userId;
    }

    return null;
  } catch {
    sessionStorage.removeItem('userId');
    return null;
  }
}

export function storageGetItem(key: string): any | null {
  try {
    const localStorage = getLocalStorage();
    if (!localStorage) return null;

    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return null;
  }
}
export function clearStorage() {
  try {
    const localStorage = getLocalStorage();
    if (!localStorage) return false;
    localStorage.clear();
    const sessionStorage = getSessionStorage();
    if (!sessionStorage) return false;
    sessionStorage.clear();
    invalidateAll();
    return true;
  } catch {
    return false;
  }
}
export function storageSetItem(key: string, value: any): boolean {
  try {
    const localStorage = getLocalStorage();
    if (!localStorage) return false;
    localStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch {
    return false;
  }
}

export class AsyncLocalStorage<State> {
  private storageKey: StorageKey;

  constructor(storageKey: StorageKey) {
    this.storageKey = storageKey;

    // skip server side rendering
    if (typeof window === 'undefined') return;

    // migrate old data
    if (localStorage.getItem(PREV_KEY)) {
      const data = JSON.parse(localStorage.getItem(PREV_KEY) || '{}');

      const preference = data.state.preference;

      if (data.state?.preference) {
        localStorage.setItem('MIGHTY_PREFERENCE', JSON.stringify(preference));
      }
      localStorage.removeItem(PREV_KEY);
    }
  }

  async saveToLocalStorage(state: object) {
    const data = await this.getFromLocalStorage();

    localStorage.setItem(this.storageKey, JSON.stringify({ ...data, ...state }));
  }

  async getFromLocalStorage(key: StorageKey = this.storageKey): Promise<State> {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }
}

const CACHE_PREFIX = 'cf_cache_';
const SYNCED_PREFIX = 'cf_synced_';

function getStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function getCached<T>(key: string): T | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    getStorage()?.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch {
    // storage full — silently ignore
  }
}

export function isSynced(key: string): boolean {
  return getStorage()?.getItem(SYNCED_PREFIX + key) === '1';
}

export function markSynced(key: string): void {
  getStorage()?.setItem(SYNCED_PREFIX + key, '1');
}

export function invalidateCache(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(CACHE_PREFIX + key);
  storage.removeItem(SYNCED_PREFIX + key);
}

export function invalidateAll(): void {
  const storage = getStorage();
  if (!storage) return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k && (k.startsWith(CACHE_PREFIX) || k.startsWith(SYNCED_PREFIX))) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => storage.removeItem(k));
}
