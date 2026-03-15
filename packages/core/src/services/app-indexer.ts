import { readdirSync, statSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { isWindows, isMac, isLinux } from '@mighty/utils/platform';
import { homedir } from 'os';

export interface IndexedApp {
  icon?: string;
  name: string;
  path: string;
}

let indexedApps: IndexedApp[] = [];

function scanDirectory(dir: string, extensions: string[]): IndexedApp[] {
  const apps: IndexedApp[] = [];
  if (!existsSync(dir)) return apps;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      try {
        if (entry.isDirectory()) {
          // Recurse into subdirectories (for Start Menu nested folders)
          apps.push(...scanDirectory(fullPath, extensions));
        } else if (extensions.includes(extname(entry.name).toLowerCase())) {
          apps.push({
            name: basename(entry.name, extname(entry.name)),
            path: fullPath,
          });
        }
      } catch {
        // Skip inaccessible entries
      }
    }
  } catch {
    // Skip inaccessible directories
  }

  return apps;
}

function indexWindowsApps(): IndexedApp[] {
  const dirs = [
    join(process.env['PROGRAMDATA'] || 'C:\\ProgramData', 'Microsoft\\Windows\\Start Menu\\Programs'),
    join(process.env['APPDATA'] || '', 'Microsoft\\Windows\\Start Menu\\Programs'),
    join(homedir(), 'Desktop'),
  ];

  const apps: IndexedApp[] = [];
  for (const dir of dirs) {
    apps.push(...scanDirectory(dir, ['.lnk', '.exe', '.url']));
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return apps.filter((app) => {
    const key = app.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function indexMacApps(): IndexedApp[] {
  const dirs = ['/Applications', join(homedir(), 'Applications')];
  const apps: IndexedApp[] = [];
  for (const dir of dirs) {
    apps.push(...scanDirectory(dir, ['.app']));
  }
  return apps;
}

function indexLinuxApps(): IndexedApp[] {
  const dirs = ['/usr/share/applications', join(homedir(), '.local/share/applications')];
  const apps: IndexedApp[] = [];
  for (const dir of dirs) {
    apps.push(...scanDirectory(dir, ['.desktop']));
  }
  return apps;
}

export function indexApps(): IndexedApp[] {
  if (isWindows) {
    indexedApps = indexWindowsApps();
  } else if (isMac) {
    indexedApps = indexMacApps();
  } else if (isLinux) {
    indexedApps = indexLinuxApps();
  }

  console.log(`Indexed ${indexedApps.length} applications`);
  return indexedApps;
}

export function getIndexedApps(): IndexedApp[] {
  return indexedApps;
}

export function searchApps(query: string): IndexedApp[] {
  if (!query) return indexedApps.slice(0, 20);
  const lower = query.toLowerCase();
  return indexedApps.filter((app) => app.name.toLowerCase().includes(lower));
}
