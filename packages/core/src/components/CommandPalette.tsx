import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Search,
  ClipboardList,
  FileText,
  Plus,
  Folder,
  Settings,
  X,
  Sparkles,
  ExternalLink,
  Pin,
  PinOff,
  Globe,
  Pencil,
  Trash2,
  Calculator,
  Palette,
  Type,
  Puzzle,
  Brain,
  Bot,
  Bookmark,
} from 'lucide-react';
import { useQuickLinks, useLauncherPins } from '../db/hooks';
import { registry } from '../plugins/registry';
import { useDevExtensions } from '../contexts/DevExtensionsContext';

interface Command {
  action: string;
  icon: string;
  id: string;
  subtitle: string;
  title: string;
}

const COMMANDS: Command[] = [
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
    subtitle: 'Organize your collections and categories',
    icon: 'Folder',
    action: 'categories',
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Configure preferences and shortcuts',
    icon: 'Settings',
    action: 'settings',
  },
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
  isPinned?: boolean;
  isQuickLink?: boolean;
  section: 'pinned' | 'quicklinks' | 'commands';
  subtitle: string;
  title: string;
  url?: string;
}

const CommandPalette = ({ isOpen, onClose, onCommandSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [showAddLink, setShowAddLink] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { links: quickLinks, create: createLink, update: updateLink, remove: removeLink } = useQuickLinks();
  const { pins, pin, unpin, isPinned } = useLauncherPins();
  const { devExtensions } = useDevExtensions();

  // Build unified list: pinned first, then quick links, then commands
  const buildItems = (): ListItem[] => {
    const items: ListItem[] = [];
    const q = searchQuery.toLowerCase();

    // Pinned items
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
            isPinned: true,
            isQuickLink: true,
            url: ql.url,
          };
        return null;
      })
      .filter(Boolean) as ListItem[];

    const pinnedIds = new Set(pins.map((p) => p.commandId));

    // Quick Links (not already pinned)
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

    // Commands (not already pinned)
    const cmdItems: ListItem[] = COMMANDS.filter((c) => !pinnedIds.has(c.id)).map((c) => ({
      ...c,
      section: 'commands' as const,
    }));

    // Plugin commands
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

    // Dev extension commands
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

    // Filter by search
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery('');
      setShowAddLink(false);
      setEditingLink(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || showAddLink || editingLink) return;
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
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose, showAddLink, editingLink]);

  const handleSelect = (item: ListItem) => {
    if (item.action.startsWith('quicklink:')) {
      window.open(item.url, '_blank');
    } else {
      onCommandSelect(item.action);
    }
    setSearchQuery('');
    onClose();
  };

  const handlePin = (e: React.MouseEvent, item: ListItem) => {
    e.stopPropagation();
    if (isPinned(item.id)) {
      unpin(item.id);
    } else {
      pin(item.id, item.title);
    }
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    let url = newLink.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    createLink({ title: newLink.title.trim(), url, icon: 'Globe', isPinned: false });
    setNewLink({ title: '', url: '' });
    setShowAddLink(false);
  };

  const handleDeleteLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    unpin(id);
    removeLink(id);
  };

  if (!isOpen) return null;

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
              data-testid={`cmd-${item.id}`}
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
                      handleDeleteLink(e, item.id);
                    }}
                    data-testid={`delete-ql-${item.id}`}
                    className="rounded p-1 text-gray-500 transition-colors hover:bg-red-500/20 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePin(e, item);
                  }}
                  data-testid={`pin-${item.id}`}
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

  // Split items by section
  const pinnedItems = items.filter((i) => i.section === 'pinned');
  const qlItems = items.filter((i) => i.section === 'quicklinks');
  const cmdItems = items.filter((i) => i.section === 'commands');

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]" onClick={onClose}>
        <div
          className="mx-4 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e]/95 shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}>
          {/* Search */}
          <div className="flex items-center gap-3 border-white/10 border-b px-4 py-3.5">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type a command or search..."
              data-testid="command-palette-search"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            <button
              onClick={() => setShowAddLink(!showAddLink)}
              data-testid="add-quicklink-btn"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              title="Add Quick Link">
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
              <X className="h-4 w-4" />
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
                  data-testid="quicklink-title-input"
                  className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
                />
                <input
                  type="text"
                  placeholder="https://..."
                  value={newLink.url}
                  onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                  data-testid="quicklink-url-input"
                  className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
                />
                <button
                  onClick={handleAddLink}
                  data-testid="quicklink-save-btn"
                  className="rounded bg-blue-600 px-3 py-1.5 font-medium text-sm text-white transition-colors hover:bg-blue-700">
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="custom-scrollbar max-h-[400px] overflow-y-auto py-1">
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
            <span className="ml-auto flex items-center gap-1 text-gray-600">
              <Pin className="h-3 w-3" /> Hover to pin
            </span>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CommandPalette;
