/** Stub for node:stream/promises in renderer */
export const pipeline = (): Promise<never> => {
  throw new Error('stream/promises is not available in the renderer');
};
