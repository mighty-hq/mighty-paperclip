import type { Application } from './Application';

export async function getFrontmostApplication(): Promise<Application> {
  throw new Error('getFrontmostApplication not supported in browser');
}
