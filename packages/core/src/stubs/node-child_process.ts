/** Stub for node:child_process in renderer - not available in browser */
const noop = (): never => {
  throw new Error('child_process is not available in the renderer');
};
export default { spawn: noop, exec: noop, execSync: noop };
