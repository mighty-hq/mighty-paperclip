export namespace LocalStorage {
  export async function getItem<T = string>(key: string): Promise<T | undefined> {
    const value = localStorage.getItem(key);
    return (value ?? undefined) as T | undefined;
  }
  export async function setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }
  export async function removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
  export async function clear(): Promise<void> {
    localStorage.clear();
  }
  export async function allItems(): Promise<Record<string, string>> {
    const out: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) out[k] = localStorage.getItem(k) ?? '';
    }
    return out;
  }
}
