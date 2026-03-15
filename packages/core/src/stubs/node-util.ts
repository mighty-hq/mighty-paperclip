/** Stub for node:util in renderer */
export const promisify = <T>(fn: (...args: unknown[]) => unknown): ((...args: unknown[]) => Promise<T>) => {
  return (() => Promise.reject(new Error('util.promisify not available in renderer'))) as (
    ...args: unknown[]
  ) => Promise<T>;
};
