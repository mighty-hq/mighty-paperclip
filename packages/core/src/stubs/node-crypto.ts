/** Stub for node:crypto in renderer */
const noop = (): never => {
  throw new Error('crypto is not available in the renderer');
};
export default { createHash: noop, randomBytes: noop };
