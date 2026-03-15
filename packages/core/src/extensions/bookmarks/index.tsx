import React, { useState } from 'react';
import manifest from './manifest.json';
import type { PluginManifest, PluginAPI } from '../../plugins/types';

interface BookmarkLink {
  id: string;
  title: string;
  url: string;
}

function normalizeQuickLinks(raw: unknown[]): BookmarkLink[] {
  return raw
    .map((item) => {
      const candidate = item as Record<string, unknown>;
      if (typeof candidate?.id !== 'string') return null;
      if (typeof candidate?.title !== 'string') return null;
      if (typeof candidate?.url !== 'string') return null;
      return { id: candidate.id, title: candidate.title, url: candidate.url };
    })
    .filter((item): item is BookmarkLink => Boolean(item));
}

const BookmarksPanel: React.ComponentType<{ api: PluginAPI }> = ({ api }) => {
  const [query, setQuery] = useState('');
  const [, forceRefresh] = useState(0);

  const allLinks = normalizeQuickLinks(api.quickLinks.getAll() as unknown[]);
  const q = query.trim().toLowerCase();
  const links = !q
    ? allLinks
    : allLinks.filter((item) => item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q));

  const openUrl = (url: string) => {
    const mightyhq = (window as any).mightyhq;
    if (mightyhq?.openExternal) {
      mightyhq.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
    api.ui.closeLauncher();
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    api.ui.showToast({ title: 'URL copied', description: url, duration: 1500 });
  };

  const removeUrl = (id: string) => {
    api.quickLinks.remove(id);
    forceRefresh((v) => v + 1);
    api.ui.showToast({ title: 'Bookmark removed', duration: 1200 });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bookmarks..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/40"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        {links.length === 0 && <div className="px-3 py-4 text-gray-500 text-sm">No bookmarks available.</div>}
        {links.map((item) => (
          <div key={item.id} className="flex items-center gap-2 border-white/10 border-b px-3 py-2 last:border-b-0">
            <button
              type="button"
              onClick={() => openUrl(item.url)}
              className="flex-1 text-left text-white transition-colors hover:text-blue-300">
              <div className="text-sm">{item.title}</div>
              <div className="truncate text-gray-500 text-xs">{item.url}</div>
            </button>
            <button
              type="button"
              onClick={() => copyUrl(item.url)}
              className="rounded bg-white/5 px-2 py-1 text-gray-300 text-xs hover:bg-white/10">
              Copy
            </button>
            <button
              type="button"
              onClick={() => removeUrl(item.id)}
              className="rounded bg-white/5 px-2 py-1 text-gray-300 text-xs hover:bg-red-500/20">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const bookmarksPlugin: PluginManifest = {
  id: manifest.id,
  name: manifest.name,
  description: manifest.description,
  version: manifest.version,
  author: 'Mighty Shortcut',
  icon: 'Globe',
  enabled: true,
  commands: [
    {
      id: manifest.commands[0]?.id ?? 'search-bookmarks',
      title: manifest.commands[0]?.name ?? 'Search Bookmarks',
      subtitle: manifest.commands[0]?.subtitle ?? 'Bookmarks',
      icon: 'Globe',
      mode: 'view',
      panelId: 'bookmarks-panel',
      action: () => {},
    },
  ],
  panels: [{ id: 'bookmarks-panel', title: 'Bookmarks', icon: 'Globe', component: BookmarksPanel }],
};
