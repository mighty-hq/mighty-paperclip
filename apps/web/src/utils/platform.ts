import { platform } from 'os';

export const isWindows = platform() === 'win32';
export const isMac = platform() === 'darwin';
export const isLinux = platform() === 'linux';

export function getPlatform(): 'windows' | 'mac' | 'linux' {
  if (isWindows) return 'windows';
  if (isMac) return 'mac';
  return 'linux';
}
