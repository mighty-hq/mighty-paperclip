import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  ClipboardList,
  FileText,
  Plus,
  Folder,
  Settings,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Pin,
  PinOff,
  Globe,
  Trash2,
  Calculator,
  Palette,
  Type,
  Puzzle,
  Brain,
  Bot,
  Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuickLinks, useLauncherPins } from '../db/hooks';
import { registry } from '../plugins/registry';
import { useDevExtensions } from '../contexts/DevExtensionsContext';
import type { PluginAPI } from '../plugins/types';
import SnippetsBrowser from '../components/SnippetsBrowser';
import PromptsBrowser from '../components/PromptsBrowser';

const COMMANDS = [
  {
    id: 'clipboard',
    title: 'Clipboard History',
    subtitle: 'View and search clipboard history',
    icon: 'ClipboardList',
    action: 'clipboard',
  },
  {
    id: 'snippets',
    title: 'My Snippets',
    subtitle: 'Browse saved snippets and presets',
    icon: 'FileText',
    action: 'snippets',
  },
  {
    id: 'prompts',
    title: 'Prompts Library',
    subtitle: 'Browse and manage AI prompts',
    icon: 'Sparkles',
    action: 'prompts',
  },
  { id: 'skills', title: 'Skills', subtitle: 'Open reusable skill cards', icon: 'Brain', action: 'skills' },
  { id: 'agents', title: 'Agents', subtitle: 'Open recipe-style team agents', icon: 'Bot', action: 'agents' },
  {
    id: 'bookmarks',
    title: 'Bookmarks',
    subtitle: 'Open nested bookmark manager',
    icon: 'Bookmark',
    action: 'bookmarks',
  },
  {
    id: 'create-snippet',
    title: 'Create Snippet',
    subtitle: 'Save a new snippet or preset',
    icon: 'Plus',
    action: 'createSnippet',
  },
  {
    id: 'categories',
    title: 'Manage Categories',
    subtitle: 'Organize your collections',
    icon: 'Folder',
    action: 'categories',
  },
  {
    id: 'extensions',
    title: 'Extensions',
    subtitle: 'Manage plugins and extensions',
    icon: 'Puzzle',
    action: 'extensions',
  },
  { id: 'settings', title: 'Settings', subtitle: 'Configure preferences', icon: 'Settings', action: 'settings' },
];

const iconMap: Record<string, any> = {
  ClipboardList,
  FileText,
  Plus,
  Folder,
  Settings,
  Sparkles,
  ExternalLink,
  Globe,
  Calculator,
  Palette,
  Type,
  Puzzle,
  Brain,
  Bot,
  Bookmark,
};

interface ListItem {
  action: string;
  icon: string;
  id: string;
  isQuickLink?: boolean;
  section: 'pinned' | 'quicklinks' | 'commands';
  subtitle: string;
  title: string;
  url?: string;
}

const isElectronRuntime = () => Boolean((window as any).mightyhq?.isElectron);
const hideLauncher = () => {
  const mightyhq = (window as any).mightyhq;
  if (mightyhq?.hideLauncher) {
    mightyhq.hideLauncher();
  } else {
    window.location.hash = '/dashboard';
  }
};
const setLauncherView = (viewId: string) => (window as any).mightyhq?.setLauncherView?.(viewId);

const LauncherPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [activePanel, setActivePanel] = useState<ReturnType<typeof registry.getPanels>[0] | null>(null);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [snippetsSearch, setSnippetsSearch] = useState('');
  const [promptsSearch, setPromptsSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isElectron = isElectronRuntime();

  // Transparent launcher window: only for Electron window mode
  useEffect(() => {
    if (!isElectron) return;
    const prevHtml = document.documentElement.style.background;
    const prevBody = document.body.style.background;
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    return () => {
      document.documentElement.style.background = prevHtml;
      document.body.style.background = prevBody;
    };
  }, [isElectron]);

  const { links: quickLinks, create: createLink, remove: removeLink } = useQuickLinks();
  const { pins, pin, unpin, isPinned } = useLauncherPins();
  const { devExtensions } = useDevExtensions();

  const createPluginAPI = useCallback(
    (pluginId: string): PluginAPI => ({
      snippets: { getAll: () => [], create: () => ({}) as any, update: () => ({}) as any, remove: () => false },
      prompts: { getAll: () => [], create: () => ({}) as any, update: () => ({}) as any, remove: () => false },
      clipboard: { getHistory: () => [], add: () => {}, copyToClipboard: (t) => navigator.clipboard.writeText(t) },
      quickLinks: { getAll: () => quickLinks, create: createLink, remove: removeLink },
      ui: {
        showToast: (opts) => toast(opts.title, { description: opts.description, duration: opts.duration ?? 2000 }),
        closeLauncher: hideLauncher,
      },
      getPluginSetting: (k) => registry.getPluginSetting(pluginId, k),
      setPluginSetting: (k, v) => registry.setPluginSetting(pluginId, k, v),
    }),
    [quickLinks, createLink, removeLink]
  );

  const buildItems = (): ListItem[] => {
    const items: ListItem[] = [];
    const q = searchQuery.toLowerCase();
    const pinnedIds = new Set(pins.map((p) => p.commandId));

    const pinnedItems = pins
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => {
        const cmd = COMMANDS.find((c) => c.id === p.commandId);
        const ql = quickLinks.find((l) => l.id === p.commandId);
        if (cmd) return { ...cmd, section: 'pinned' as const, isPinned: true };
        if (ql)
          return {
            id: ql.id,
            title: ql.title,
            subtitle: ql.url,
            icon: 'Globe',
            action: `quicklink:${ql.url}`,
            section: 'pinned' as const,
            isQuickLink: true,
            url: ql.url,
          };
        return null;
      })
      .filter(Boolean) as ListItem[];

    const linkItems: ListItem[] = quickLinks
      .filter((l) => !pinnedIds.has(l.id))
      .map((l) => ({
        id: l.id,
        title: l.title,
        subtitle: l.url,
        icon: 'Globe',
        action: `quicklink:${l.url}`,
        section: 'quicklinks' as const,
        isQuickLink: true,
        url: l.url,
      }));

    const cmdItems: ListItem[] = COMMANDS.filter((c) => !pinnedIds.has(c.id)).map((c) => ({
      ...c,
      section: 'commands' as const,
    }));

    const pluginCmds: ListItem[] = registry
      .getCommands()
      .filter((c) => !pinnedIds.has(c.id))
      .map((c) => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle,
        icon: c.icon || 'Puzzle',
        action: `plugin:${c.pluginId}:${c.id}`,
        section: 'commands' as const,
      }));

    const devExtCmds: ListItem[] = devExtensions
      .filter((ext) => ext.enabled)
      .flatMap((ext) =>
        (ext.commands || []).map((cmd) => ({
          id: `${ext.id}:${cmd.name}`,
          title: cmd.title,
          subtitle: ext.title,
          icon: ext.icon || 'Puzzle',
          action: `dev-ext:${ext.id}:${cmd.name}`,
          section: 'commands' as const,
        }))
      )
      .filter((c) => !pinnedIds.has(c.id));

    const filter = (list: ListItem[]) =>
      q ? list.filter((i) => i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q)) : list;
    items.push(
      ...filter(pinnedItems),
      ...filter(linkItems),
      ...filter(cmdItems),
      ...filter(pluginCmds),
      ...filter(devExtCmds)
    );
    return items;
  };

  const items = buildItems();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Tell main process which view is shown so it can use LAUNCHER_SIZE_EXPANDED for complex views
  useEffect(() => {
    let viewId = '';
    if (showSnippets) viewId = 'snippets';
    else if (showPrompts) viewId = 'prompts';
    else if (activePanel) viewId = `plugin:${activePanel.pluginId}:${activePanel.id}`;
    setLauncherView(viewId);
  }, [showSnippets, showPrompts, activePanel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddLink) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showPrompts) {
          setShowPrompts(false);
          return;
        }
        if (showSnippets) {
          setShowSnippets(false);
          return;
        }
        if (activePanel) {
          setActivePanel(null);
          return;
        }
        hideLauncher();
        return;
      }
      if (activePanel || showSnippets || showPrompts) return; // no list navigation when a panel is open
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((p) => Math.min(p + 1, items.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((p) => Math.max(p - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (items[selectedIndex]) handleSelect(items[selectedIndex]);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, showAddLink, activePanel, showSnippets, showPrompts]);

  const handleSelect = async (item: ListItem) => {
    if (item.action.startsWith('quicklink:')) {
      window.open(item.url, '_blank');
      hideLauncher();
      return;
    }
    if (item.action.startsWith('plugin:')) {
      const [, pluginId, commandId] = item.action.split(':');
      const cmd = registry.getCommand(pluginId, commandId);
      if (!cmd) {
        openDashboard('/dashboard/extensions');
        hideLauncher();
        return;
      }
      if (cmd.mode === 'view' && cmd.panelId) {
        const panel = registry.findPanelForCommand(pluginId, commandId);
        if (panel) {
          setActivePanel(panel);
          setSearchQuery('');
          return;
        }
      }
      // no-view: run action then close
      const api = createPluginAPI(pluginId);
      try {
        await cmd.action(api);
      } catch (err) {
        api.ui.showToast({ title: 'Action failed', description: String(err), duration: 2000 });
      }
      hideLauncher();
      return;
    }
    if (item.action.startsWith('dev-ext:')) {
      openDashboard('/dashboard/extensions');
      hideLauncher();
      return;
    }
    // Snippets & Prompts: show in-launcher (same window, launcher-style layout)
    if (item.action === 'snippets') {
      setShowSnippets(true);
      setSnippetsSearch('');
      setSearchQuery('');
      return;
    }
    if (item.action === 'prompts') {
      setShowPrompts(true);
      setPromptsSearch('');
      setSearchQuery('');
      return;
    }
    // Other commands: open dashboard in new window
    openDashboard(`/dashboard/${item.action === 'createSnippet' ? 'snippets' : item.action}`);
    hideLauncher();
  };

  const openDashboard = (path: string) => {
    if (!isElectronRuntime()) {
      window.location.hash = path;
      return;
    }
    const mightyhq = (window as any).mightyhq;
    if (mightyhq?.hideLauncher) {
      mightyhq.hideLauncher();
    }
    const base = window.location.href.split('#')[0];
    window.open(`${base}#${path}`, '_blank');
  };

  const handlePin = (e: React.MouseEvent, item: ListItem) => {
    e.stopPropagation();
    isPinned(item.id) ? unpin(item.id) : pin(item.id, item.title);
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    let url = newLink.url.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    createLink({ title: newLink.title.trim(), url, icon: 'Globe', isPinned: false });
    setNewLink({ title: '', url: '' });
    setShowAddLink(false);
  };

  const renderSection = (label: string, sectionItems: ListItem[], startIdx: number) => {
    if (sectionItems.length === 0) return null;
    return (
      <div key={label}>
        <div className="px-4 pt-3 pb-1 font-semibold text-[10px] text-gray-500 uppercase tracking-widest">{label}</div>
        {sectionItems.map((item, i) => {
          const globalIdx = startIdx + i;
          const Icon = iconMap[item.icon] || ExternalLink;
          const pinned = isPinned(item.id);
          return (
            <div
              key={item.id + item.section}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(item);
                }
              }}
              data-testid={`launcher-${item.id}`}
              className={`group flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${globalIdx === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${pinned ? 'bg-amber-500/15' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'}`}>
                <Icon className={`h-4 w-4 ${pinned ? 'text-amber-400' : 'text-blue-400'}`} />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate font-medium text-sm text-white">{item.title}</div>
                <div className="truncate text-gray-500 text-xs">{item.subtitle}</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {item.isQuickLink && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      unpin(item.id);
                      removeLink(item.id);
                    }}
                    className="rounded p-1 text-gray-500 transition-colors hover:bg-red-500/20 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => handlePin(e, item)}
                  className={`rounded p-1 transition-colors ${pinned ? 'text-amber-400 hover:bg-amber-500/20' : 'text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                  {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </button>
              </div>
              {globalIdx === selectedIndex && <span className="font-mono text-gray-500 text-xs">↵</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const pinnedItems = items.filter((i) => i.section === 'pinned');
  const qlItems = items.filter((i) => i.section === 'quicklinks');
  const cmdItems = items.filter((i) => i.section === 'commands');

  // Wrapper: transparent so window corners show through; inner panel has dark bg + rounded corners
  const launcherPanelClass =
    'rounded-2xl overflow-hidden bg-[#1e1e1e] text-white flex flex-col border border-white/5 shadow-2xl';
  const launcherShellClass = isElectron
    ? 'h-screen w-full bg-transparent flex flex-col p-2'
    : 'fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh]';

  const renderInShell = (content: React.ReactNode, panelExtraClass = 'flex-1 min-h-0') => {
    const panelClass = isElectron
      ? `${panelExtraClass} ${launcherPanelClass}`
      : `${panelExtraClass} ${launcherPanelClass} w-full max-w-2xl h-[560px]`;

    const panelNode = (
      <div className={panelClass} onClick={(e) => e.stopPropagation()}>
        {content}
      </div>
    );

    if (isElectron) {
      return <div className={launcherShellClass}>{panelNode}</div>;
    }

    return (
      <div
        className={launcherShellClass}
        onClick={(e) => {
          if (e.target === e.currentTarget) hideLauncher();
        }}>
        {panelNode}
      </div>
    );
  };

  // Launcher-style Snippets (inline, fills window; no modal so no cut-off)
  if (showSnippets) {
    return renderInShell(
      <>
        <div className="flex shrink-0 items-center gap-2 border-white/10 border-b px-3 py-2.5">
          <button
            type="button"
            onClick={() => setShowSnippets(false)}
            className="shrink-0 rounded p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="relative min-w-0 flex-1">
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 shrink-0 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={snippetsSearch}
              onChange={(e) => setSnippetsSearch(e.target.value)}
              placeholder="Search snippets..."
              className="w-full rounded border border-white/10 bg-white/5 py-1.5 pr-2 pl-8 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SnippetsBrowser searchQuery={snippetsSearch} />
        </div>
      </>
    );
  }

  // Launcher-style Prompts (inline, fills window)
  if (showPrompts) {
    return renderInShell(
      <>
        <div className="flex shrink-0 items-center gap-2 border-white/10 border-b px-3 py-2.5">
          <button
            type="button"
            onClick={() => setShowPrompts(false)}
            className="shrink-0 rounded p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="relative min-w-0 flex-1">
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 shrink-0 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={promptsSearch}
              onChange={(e) => setPromptsSearch(e.target.value)}
              placeholder="Search prompts..."
              className="w-full rounded border border-white/10 bg-white/5 py-1.5 pr-2 pl-8 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <PromptsBrowser searchQuery={promptsSearch} />
        </div>
      </>
    );
  }

  // Panel view (view-mode plugin command, e.g. Calculator)
  if (activePanel) {
    const PanelComponent = activePanel.component;
    const api = createPluginAPI(activePanel.pluginId);
    return renderInShell(
      <>
        <div className="flex shrink-0 items-center gap-2 border-white/10 border-b px-4 py-2.5">
          <button
            onClick={() => setActivePanel(null)}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="truncate font-medium text-sm">{activePanel.title}</span>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          <PanelComponent api={api} />
        </div>
      </>
    );
  }

  return renderInShell(
    <>
      {/* Search */}
      <div className="flex items-center gap-3 border-white/10 border-b px-4 py-3.5">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type a command or search..."
          data-testid="launcher-search"
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
        <button
          onClick={() => setShowAddLink(!showAddLink)}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Add Quick Link">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add Quick Link form */}
      {showAddLink && (
        <div className="border-white/10 border-b bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 shrink-0 text-blue-400" />
            <input
              type="text"
              placeholder="Link title"
              value={newLink.title}
              onChange={(e) => setNewLink((p) => ({ ...p, title: e.target.value }))}
              className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
            <input
              type="text"
              placeholder="https://..."
              value={newLink.url}
              onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleAddLink}
              className="rounded bg-blue-600 px-3 py-1.5 font-medium text-sm text-white transition-colors hover:bg-blue-700">
              Add
            </button>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="custom-scrollbar flex-1 overflow-y-auto py-1">
        {items.length > 0 ? (
          <>
            {renderSection('Pinned', pinnedItems, 0)}
            {renderSection('Quick Links', qlItems, pinnedItems.length)}
            {renderSection('Commands', cmdItems, pinnedItems.length + qlItems.length)}
          </>
        ) : (
          <div className="py-10 text-center text-gray-500">
            <Search className="mx-auto mb-2 h-7 w-7 opacity-50" />
            <p className="text-sm">No commands found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 border-white/10 border-t px-4 py-2 text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <kbd className="rounded bg-white/5 px-1.5 py-0.5">↑↓</kbd> Navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded bg-white/5 px-1.5 py-0.5">↵</kbd> Select
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded bg-white/5 px-1.5 py-0.5">Esc</kbd> Close
        </span>
      </div>
    </>,
    'flex-1 min-h-0 flex flex-col overflow-hidden'
  );
};

export default LauncherPage;
