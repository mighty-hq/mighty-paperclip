import type { Application } from './Application';

export namespace WindowManagement {
  export enum DesktopType {
    User = 'User',
    FullScreen = 'FullScreen',
  }
  export type Window = {
    id: string;
    application?: Application;
    bounds: { position: { x: number; y: number }; size: { width: number; height: number } } | 'fullscreen';
    desktopId: string;
    fullScreenSettable: boolean;
    resizable: boolean;
    positionable: boolean;
    active: boolean;
  };
  export type Desktop = {
    size: { width: number; height: number };
    id: string;
    screenId: string;
    active: boolean;
    type: DesktopType;
  };
  export async function getDesktops(): Promise<Desktop[]> {
    return [];
  }
  export async function getActiveWindow(): Promise<Window> {
    throw new Error('getActiveWindow not supported in browser');
  }
  export async function getWindowsOnActiveDesktop(): Promise<Window[]> {
    return [];
  }
  export async function setWindowBounds(_options: { id: string; bounds?: unknown }): Promise<void> {
    // no-op
  }
}
