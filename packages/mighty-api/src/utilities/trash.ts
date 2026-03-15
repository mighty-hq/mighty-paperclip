import type { PathLike } from '../types/common';

export async function trash(_path: PathLike | PathLike[]): Promise<void> {
  // Browser/Electron: no native trash; would need Node integration
  console.warn('[https://github.com] trash() is not supported in browser context');
}
