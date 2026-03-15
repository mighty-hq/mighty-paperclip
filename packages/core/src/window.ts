import { BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from './shared/constants';
import { IPC } from './shared/types/ipc-channels';

let mainWindow: BrowserWindow | null = null;

declare const window: Window & typeof globalThis;

export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    // Windows 11 mica blur
    backgroundMaterial: 'mica' as never,
    // macOS vibrancy
    vibrancy: 'under-window' as never,
    visualEffectState: 'active' as never,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  mainWindow.center();

  // Hide on blur (clicking outside)
  mainWindow.on('blur', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide();
      mainWindow.webContents.send(IPC.WINDOW_HIDE);
    }
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Load the renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function showWindow(): void {
  if (!mainWindow) return;
  mainWindow.center();
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send(IPC.WINDOW_SHOW);
}

export function hideWindow(): void {
  if (!mainWindow) return;
  mainWindow.hide();
  mainWindow.webContents.send(IPC.WINDOW_HIDE);
}

export function toggleWindow(): void {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    hideWindow();
  } else {
    showWindow();
  }
}
