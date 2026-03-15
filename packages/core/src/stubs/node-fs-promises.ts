/** Stub for node:fs/promises in renderer */
const noop = async (): Promise<never> => {
  throw new Error('fs/promises is not available in the renderer');
};
export const stat = noop;
export const copyFile = noop;
export const mkdir = noop;
export const writeFile = noop;
