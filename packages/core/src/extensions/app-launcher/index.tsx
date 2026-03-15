import React, { useEffect, useMemo, useState } from 'react';
import manifest from './manifest.json';
import type { PluginManifest, PluginAPI } from '../../plugins/types';

interface IndexedApp {
  name: string;
  path: string;
}

const DEBOUNCE_MS = 120;

const AppLauncherPanel: React.ComponentType<{ api: PluginAPI }> = ({ api }) => {
  const [query, setQuery] = useState('');
  const [apps, setApps] = useState<IndexedApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mightyhq = useMemo(() => (window as any).mightyhq, []);

  useEffect(() => {
    let disposed = false;
    const t = setTimeout(async () => {
      if (!mightyhq?.searchApps) {
        setError('Application indexing is available in Electron only.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const results = await mightyhq.searchApps(query.trim());
        if (!disposed) {
          setApps(Array.isArray(results) ? results : []);
        }
      } catch (err) {
        if (!disposed) {
          setError(String(err));
          setApps([]);
        }
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      disposed = true;
      clearTimeout(t);
    };
  }, [mightyhq, query]);

  const launch = async (app: IndexedApp) => {
    if (!mightyhq?.launchApp) {
      api.ui.showToast({ title: 'Unavailable', description: 'Launch is available in Electron only.', duration: 1800 });
      return;
    }
    await mightyhq.launchApp(app.path);
    api.ui.closeLauncher();
  };

  const copyPath = async (path: string) => {
    await navigator.clipboard.writeText(path);
    api.ui.showToast({ title: 'Copied', description: path, duration: 1500 });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search installed applications..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/40"
        />
      </div>
      {error && <p className="mb-3 text-amber-400 text-xs">{error}</p>}
      <div className="overflow-hidden rounded-xl border border-white/10">
        {loading && <div className="bg-white/5 px-3 py-2 text-gray-400 text-xs">Searching applications...</div>}
        {!loading && apps.length === 0 && (
          <div className="px-3 py-4 text-gray-500 text-sm">No applications found for your query.</div>
        )}
        {!loading &&
          apps.map((app) => (
            <div key={app.path} className="flex items-center gap-2 border-white/10 border-b px-3 py-2 last:border-b-0">
              <button
                type="button"
                onClick={() => launch(app)}
                className="flex-1 text-left text-white transition-colors hover:text-blue-300">
                <div className="text-sm">{app.name}</div>
                <div className="truncate text-gray-500 text-xs">{app.path}</div>
              </button>
              <button
                type="button"
                onClick={() => copyPath(app.path)}
                className="rounded bg-white/5 px-2 py-1 text-gray-300 text-xs hover:bg-white/10">
                Copy Path
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export const appLauncherPlugin: PluginManifest = {
  id: manifest.id,
  name: manifest.name,
  description: manifest.description,
  version: manifest.version,
  author: 'Mighty Shortcut',
  icon: 'Puzzle',
  enabled: true,
  commands: [
    {
      id: manifest.commands[0]?.id ?? 'search-apps',
      title: manifest.commands[0]?.name ?? 'Search Applications',
      subtitle: manifest.commands[0]?.subtitle ?? 'Applications',
      icon: 'Puzzle',
      mode: 'view',
      panelId: 'app-launcher-panel',
      action: () => {},
    },
  ],
  panels: [{ id: 'app-launcher-panel', title: 'Application Launcher', icon: 'Puzzle', component: AppLauncherPanel }],
};
