export interface CRUDOperations<T, CreateInput = Omit<T, 'id'>> {
  create: (data: CreateInput) => T;
  getAll: () => T[];
  remove: (id: string) => boolean;
  update: (id: string, data: Partial<T>) => T | null;
}

export type SyncOperation = 'insert' | 'update' | 'delete' | 'upsert';
