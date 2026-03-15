import type { Application } from './Application';
import type { PathLike } from '../types/common';

export async function getDefaultApplication(_path: PathLike): Promise<Application> {
  throw new Error('getDefaultApplication not supported in browser');
}
