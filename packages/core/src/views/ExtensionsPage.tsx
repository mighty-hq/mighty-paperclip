import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from '../utils/useNavigation';
import {
  Puzzle,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Calculator,
  Palette,
  Type,
  Plus,
  Code,
  Trash2,
  Lock,
  Globe,
  Package,
  Search,
  Eye,
  FileText,
  Terminal,
  Zap,
  Star,
  Hash,
  Shield,
  Clock,
  Download,
  Upload,
  Mail,
  Image,
  Music,
  Video,
  Database,
  Cpu,
  Wifi,
  Key,
  Copy,
  ExternalLink,
  Bell,
} from 'lucide-react';
import { registry } from '../plugins/registry';
import { useSnippets, usePrompts, useClipboard, useQuickLinks } from '../db/hooks';
import { useToast } from '../hooks/use-toast';
import { useDevExtensions } from '../contexts/DevExtensionsContext';
import type { PluginAPI, PluginPanel } from '../plugins/types';
import DynamicPanel from '../components/DynamicPanel';
import axios from 'axios';
import { readEnv } from '../env';

const API = readEnv('VITE_BACKEND_URL') ?? (typeof window !== 'undefined' ? window.location.origin : '');
const DEV_EXTENSION_PATHS_KEY = 'mightyhq_dev_extension_paths';

const iconMap: Record<string, any> = {
  Calculator,
  Palette,
  Type,
  Puzzle,
  Globe,
  Code,
  FileText,
  Search,
  Terminal,
  Zap,
  Star,
  Hash,
  Shield,
  Clock,
  Download,
  Upload,
  Mail,
  Image,
  Music,
  Video,
  Database,
  Cpu,
  Wifi,
  Key,
  Copy,
  ExternalLink,
  Bell,
  Package,
  Lock,
  Eye,
};

interface CustomExtension {
  author: string;
  commands: any[];
  created_at: string;
  description: string;
  enabled: boolean;
  icon: string;
  id: string;
  name: string;
  path?: string;
  preferences: any[];
  source?: 'api' | 'dev';
  title: string;
  updated_at: string;
  version: string;
  visibility: string;
}

const ExtensionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<(PluginPanel & { pluginId: string }) | null>(null);
  const [activeCustomPanel, setActiveCustomPanel] = useState<{ ext: CustomExtension; cmd: any } | null>(null);
  const [, forceUpdate] = useState(0);
  const [customExtensions, setCustomExtensions] = useState<CustomExtension[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'builtin' | 'custom'>('all');
  const { toast } = useToast();
  const { devExtensions, refresh: refreshDevExtensions } = useDevExtensions();
  const { snippets, create: createSnippet, update: updateSnippet, remove: removeSnippet } = useSnippets();
  const { prompts, create: createPrompt, update: updatePrompt, remove: removePrompt } = usePrompts();
  const { items: clipboardItems, add: addClipboard } = useClipboard();
  const { links: quickLinks, create: createLink, remove: removeLink } = useQuickLinks();

  const createAPI = useCallback(
    (pluginId: string): PluginAPI => ({
      snippets: { getAll: () => snippets, create: createSnippet, update: updateSnippet, remove: removeSnippet },
      prompts: { getAll: () => prompts, create: createPrompt, update: updatePrompt, remove: removePrompt },
      clipboard: {
        getHistory: () => clipboardItems,
        add: addClipboard,
        copyToClipboard: (text) => navigator.clipboard.writeText(text),
      },
      quickLinks: { getAll: () => quickLinks, create: createLink, remove: removeLink },
      ui: { showToast: (opts) => toast(opts as any), closeLauncher: () => {} },
      getPluginSetting: (key) => registry.getPluginSetting(pluginId, key),
      setPluginSetting: (key, value) => registry.setPluginSetting(pluginId, key, value),
    }),
    [
      snippets,
      prompts,
      clipboardItems,
      quickLinks,
      createSnippet,
      updateSnippet,
      removeSnippet,
      createPrompt,
      updatePrompt,
      removePrompt,
      addClipboard,
      createLink,
      removeLink,
      toast,
    ]
  );

  // Fetch custom extensions from backend (only when API base URL is set)
  useEffect(() => {
    const fetchExtensions = async () => {
      if (!API) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/api/extensions`);
        setCustomExtensions((res.data || []).map((e: CustomExtension) => ({ ...e, source: 'api' as const })));
      } catch (err) {
        console.error('Failed to fetch extensions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExtensions();
  }, []);

  const builtinPlugins = registry.getAll();
  const panels = registry.getPanels();

  const allCustomExtensions: CustomExtension[] = [
    ...customExtensions,
    ...devExtensions.map((e) => ({ ...e, source: 'dev' as const, path: e.path })),
  ];

  const handleToggle = (id: string) => {
    registry.toggle(id);
    forceUpdate((n) => n + 1);
    const p = registry.get(id);
    toast({ title: p?.enabled ? `${p.name} enabled` : `${p?.name} disabled`, duration: 1500 });
  };

  const handleCustomToggle = async (ext: CustomExtension) => {
    if (ext.source === 'dev') {
      toast({ title: 'Dev extensions are always enabled', duration: 1500 });
      return;
    }
    if (!API) return;
    try {
      const res = await axios.put(`${API}/api/extensions/${ext.id}`, { enabled: !ext.enabled });
      setCustomExtensions((prev) => prev.map((e) => (e.id === ext.id ? { ...res.data, source: 'api' as const } : e)));
      toast({ title: `${ext.title} ${!ext.enabled ? 'enabled' : 'disabled'}`, duration: 1500 });
    } catch (err) {
      console.error('Failed to toggle extension:', err);
    }
  };

  const handleDelete = async (ext: CustomExtension) => {
    if (
      !window.confirm(
        `Remove "${ext.title}" from the list?${ext.source === 'dev' ? ' (Extension folder on disk is not deleted.)' : ' This cannot be undone.'}`
      )
    )
      return;
    if (ext.source === 'dev' && ext.path) {
      try {
        const raw = localStorage.getItem(DEV_EXTENSION_PATHS_KEY);
        const paths: string[] = raw ? JSON.parse(raw) : [];
        const next = paths.filter((p) => p !== ext.path);
        localStorage.setItem(DEV_EXTENSION_PATHS_KEY, JSON.stringify(next));
        refreshDevExtensions();
      } catch (_) {}
      toast({ title: `${ext.title} removed from list`, duration: 1500 });
      return;
    }
    if (!API) return;
    try {
      await axios.delete(`${API}/api/extensions/${ext.id}`);
      setCustomExtensions((prev) => prev.filter((e) => e.id !== ext.id));
      toast({ title: `${ext.title} deleted`, duration: 1500 });
    } catch (err) {
      console.error('Failed to delete extension:', err);
    }
  };

  const handleCustomCommand = (ext: CustomExtension, cmd: any) => {
    if (cmd.mode === 'view' && cmd.panel) {
      setActiveCustomPanel({ ext, cmd });
    } else if (cmd.action) {
      switch (cmd.action.type) {
        case 'copy':
          navigator.clipboard.writeText(cmd.action.value || '');
          toast({ title: 'Copied to clipboard', duration: 1500 });
          break;
        case 'open-url':
          window.open(cmd.action.value, '_blank');
          break;
        case 'toast':
          toast({ title: cmd.action.value || 'Action executed', duration: 2000 });
          break;
      }
    }
  };

  const showCustomInQuickAccess = filter === 'all' || filter === 'custom';
  const filteredBuiltin = builtinPlugins.filter(
    (p) =>
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustom = allCustomExtensions.filter(
    (e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Active Panel View (Built-in) ───────────────────
  if (activePanel) {
    const PanelComponent = activePanel.component;
    const api = createAPI(activePanel.pluginId);
    return (
      <div className="mx-auto max-w-5xl p-8">
        <button
          onClick={() => setActivePanel(null)}
          className="mb-6 flex items-center gap-2 text-gray-400 text-sm transition-colors hover:text-white">
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Extensions
        </button>
        <h2 className="mb-6 font-bold text-2xl text-white">{activePanel.title}</h2>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <PanelComponent api={api} />
        </div>
      </div>
    );
  }

  // ── Active Panel View (Custom) ─────────────────────
  if (activeCustomPanel) {
    const { ext, cmd } = activeCustomPanel;
    return (
      <div className="mx-auto max-w-5xl p-8">
        <button
          onClick={() => setActiveCustomPanel(null)}
          className="mb-6 flex items-center gap-2 text-gray-400 text-sm transition-colors hover:text-white">
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Extensions
        </button>
        <h2 className="mb-2 font-bold text-2xl text-white">{cmd.title}</h2>
        <p className="mb-6 text-gray-500 text-sm">
          {ext.title} by {ext.author}
        </p>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <DynamicPanel widgets={cmd.panel?.widgets || []} extensionTitle={cmd.title} />
        </div>
      </div>
    );
  }

  // ── Main View ──────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-[var(--text-primary)]">Extensions</h1>
          <p className="mt-1 text-[var(--text-secondary)] text-sm">Manage built-in plugins and custom extensions</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/extensions/create')}
          data-testid="create-extension-btn"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Create Extension
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions..."
            data-testid="ext-search-input"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
          />
        </div>
        <div className="flex overflow-hidden rounded-lg border border-white/10">
          {(['all', 'builtin', 'custom'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
              className={`px-3 py-2 font-medium text-xs transition-colors ${
                filter === f ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}>
              {f === 'all' ? 'All' : f === 'builtin' ? 'Built-in' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Access Panels */}
      {panels.length > 0 && (filter === 'all' || filter === 'builtin') && (
        <div className="mb-8">
          <h2 className="mb-3 font-semibold text-gray-400 text-sm uppercase tracking-wider">Quick Access</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {panels.map((panel) => {
              const Icon = iconMap[panel.icon || ''] || Puzzle;
              return (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel)}
                  data-testid={`panel-${panel.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.06]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-white">{panel.title}</div>
                    <div className="text-gray-500 text-xs">{panel.pluginName}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-600 transition-colors group-hover:text-gray-400" />
                </button>
              );
            })}

            {/* Custom extension panels */}
            {showCustomInQuickAccess &&
              allCustomExtensions
                .filter((e) => e.enabled)
                .flatMap((ext) =>
                  ext.commands
                    .filter((c: any) => c.mode === 'view')
                    .map((cmd: any) => {
                      const Icon = iconMap[ext.icon] || Puzzle;
                      return (
                        <button
                          key={`${ext.id}-${cmd.name}`}
                          onClick={() => setActiveCustomPanel({ ext, cmd })}
                          data-testid={`custom-panel-${ext.id}-${cmd.name}`}
                          className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.06]">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 transition-transform group-hover:scale-105">
                            <Icon className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm text-white">{cmd.title}</div>
                            <div className="text-gray-500 text-xs">{ext.title}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-600 transition-colors group-hover:text-gray-400" />
                        </button>
                      );
                    })
                )}
          </div>
        </div>
      )}

      {/* Built-in Plugins */}
      {(filter === 'all' || filter === 'builtin') && filteredBuiltin.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-semibold text-gray-400 text-sm uppercase tracking-wider">Built-in Plugins</h2>
          <div className="space-y-2">
            {filteredBuiltin.map((plugin) => {
              const Icon = iconMap[plugin.icon] || Puzzle;
              return (
                <div
                  key={plugin.id}
                  data-testid={`plugin-${plugin.id}`}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      plugin.enabled ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20' : 'bg-white/5'
                    }`}>
                    <Icon className={`h-5 w-5 ${plugin.enabled ? 'text-blue-400' : 'text-gray-600'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">{plugin.name}</span>
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">
                        v{plugin.version}
                      </span>
                      <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400">built-in</span>
                    </div>
                    <div className="text-gray-500 text-xs">{plugin.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plugin.panels && plugin.panels.length > 0 && plugin.enabled && (
                      <button
                        onClick={() => {
                          const panel = panels.find((p) => p.pluginId === plugin.id);
                          if (panel) setActivePanel(panel);
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-gray-400 text-xs transition-colors hover:bg-white/10 hover:text-white">
                        Open
                      </button>
                    )}
                    <button
                      onClick={() => handleToggle(plugin.id)}
                      data-testid={`toggle-${plugin.id}`}
                      className="transition-colors">
                      {plugin.enabled ? (
                        <ToggleRight className="h-8 w-8 text-blue-500" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Extensions */}
      {(filter === 'all' || filter === 'custom') && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-400 text-sm uppercase tracking-wider">Custom Extensions</h2>
            <span className="text-gray-500 text-xs">
              {filteredCustom.length} extension{filteredCustom.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500 text-sm">Loading extensions...</div>
          ) : filteredCustom.length === 0 ? (
            <div className="rounded-xl border border-white/10 border-dashed py-10 text-center">
              <Package className="mx-auto mb-3 h-8 w-8 text-gray-600" />
              <p className="mb-1 text-gray-400 text-sm">No custom extensions yet</p>
              <p className="mb-4 text-gray-500 text-xs">Create your own or import from source</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => navigate('/dashboard/extensions/create')}
                  data-testid="create-ext-empty-btn"
                  className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 font-medium text-blue-400 text-xs transition-colors hover:bg-blue-600/30">
                  <Plus className="h-3.5 w-3.5" /> Create
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustom.map((ext) => {
                const Icon = iconMap[ext.icon] || Puzzle;
                const viewCmds = ext.commands.filter((c: any) => c.mode === 'view');
                const actionCmds = ext.commands.filter((c: any) => c.mode !== 'view');
                return (
                  <div
                    key={ext.id}
                    data-testid={`custom-ext-${ext.id}`}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        ext.enabled ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : 'bg-white/5'
                      }`}>
                      <Icon className={`h-5 w-5 ${ext.enabled ? 'text-emerald-400' : 'text-gray-600'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm text-white">{ext.title}</span>
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">
                          v{ext.version}
                        </span>
                        {ext.source === 'dev' && (
                          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400">dev</span>
                        )}
                        {ext.source !== 'dev' &&
                          (ext.visibility === 'private' ? (
                            <span className="flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
                              <Lock className="h-2.5 w-2.5" /> private
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] text-green-400">
                              <Globe className="h-2.5 w-2.5" /> public
                            </span>
                          ))}
                      </div>
                      <div className="text-gray-500 text-xs">{ext.description || 'No description'}</div>
                      <div className="mt-0.5 text-gray-600 text-xs">
                        by {ext.author} - {ext.commands.length} command{ext.commands.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Action commands */}
                      {actionCmds.map((cmd: any) => (
                        <button
                          key={cmd.name}
                          onClick={() => handleCustomCommand(ext, cmd)}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-gray-400 text-xs transition-colors hover:bg-white/10 hover:text-white"
                          title={cmd.description}>
                          {cmd.title}
                        </button>
                      ))}
                      {/* View panels */}
                      {viewCmds.length > 0 && ext.enabled && (
                        <button
                          onClick={() => setActiveCustomPanel({ ext, cmd: viewCmds[0] })}
                          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-400 text-xs transition-colors hover:bg-emerald-500/20 hover:text-emerald-300">
                          Open Panel
                        </button>
                      )}
                      <button
                        onClick={() => handleCustomToggle(ext)}
                        data-testid={`toggle-custom-${ext.id}`}
                        className="transition-colors">
                        {ext.enabled ? (
                          <ToggleRight className="h-8 w-8 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(ext)}
                        data-testid={`delete-custom-${ext.id}`}
                        className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtensionsPage;
