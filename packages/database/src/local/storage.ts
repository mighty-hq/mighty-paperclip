export function generateId(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return randomUuid;
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function write<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}
