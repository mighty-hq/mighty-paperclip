const STORAGE_KEY = 'https://github.com_cache_';

export class Cache {
  static get STORAGE_DIRECTORY_NAME(): string {
    return 'cache';
  }
  static get DEFAULT_CAPACITY(): number {
    return 10 * 1024 * 1024; // 10MB
  }
  private namespace: string;
  private prefix: string;

  constructor(options?: { namespace?: string; capacity?: number }) {
    this.namespace = options?.namespace ?? 'default';
    this.prefix = `${STORAGE_KEY}${this.namespace}_`;
  }

  get storageDirectory(): string {
    return `memory:${this.namespace}`;
  }

  get(key: string): string | undefined {
    try {
      return localStorage.getItem(this.prefix + key) ?? undefined;
    } catch {
      return undefined;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  get isEmpty(): boolean {
    return Object.keys(localStorage).filter((k) => k.startsWith(this.prefix)).length === 0;
  }

  set(key: string, data: string): void {
    localStorage.setItem(this.prefix + key, data);
  }

  remove(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch {
      return false;
    }
  }

  clear(_options?: { notifySubscribers?: boolean }): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => localStorage.removeItem(k));
  }

  subscribe(_subscriber: (key: string | undefined, data: string | undefined) => void): () => void {
    return () => {};
  }
}
