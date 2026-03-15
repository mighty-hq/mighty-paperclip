/** Stub for node:fs in renderer */
const noop = (): never => {
  throw new Error('fs is not available in the renderer');
};
export default {
  readFileSync: noop,
  createReadStream: noop,
  createWriteStream: noop,
  mkdirSync: noop,
  existsSync: () => false,
};
export const createReadStream = noop;
export const createWriteStream = noop;
export const mkdirSync = noop;
export const existsSync = (): boolean => false;
export type Stats = { isFile: () => boolean; isDirectory: () => boolean };
