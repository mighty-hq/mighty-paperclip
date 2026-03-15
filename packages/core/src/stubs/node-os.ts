/** Stub for node:os in renderer */
export default { platform: () => 'browser', tmpdir: () => '/tmp' };
export const platform = (): string => 'browser';
export const tmpdir = (): string => '/tmp';
