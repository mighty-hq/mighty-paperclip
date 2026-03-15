/** Stub for node:path in renderer */
const noop = (..._args: string[]): string => {
  throw new Error('path is not available in the renderer');
};
export default { join: noop, normalize: noop };
export const join = noop;
export const normalize = noop;
