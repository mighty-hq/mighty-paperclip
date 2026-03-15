import type { ReactNode } from 'react';

/** Path-like for file operations (browser: string) */
export type PathLike = string;

/** Arguments passed to a command */
export interface Arguments {
  [key: string]: unknown;
}

/** Context for launched commands */
export interface LaunchContext {
  [key: string]: unknown;
}

/** Actions interface for components that support ActionPanel */
export interface ActionsInterface {
  actions?: ReactNode;
}
