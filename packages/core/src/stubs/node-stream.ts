/** Stub for node:stream in renderer */
const noop = (): never => {
  throw new Error('stream is not available in the renderer');
};
export default noop;
export const Readable = noop;
export const Writable = noop;
export const Duplex = noop;
